# -*- coding: utf-8 -*-
"""Dogfooding Bundle Plugin.

Internal org bundle that registers three capabilities in one shot:

1. AgentScope Dogfooding provider
   - OpenAI-compatible LLM via https://proxy.agentscope.design/v1
2. AgentTrack startup hook
   - Initialises AgentTrack SDK (app_name="qwenpaw") on startup
3. /feedback command
   - Query-rewrite hook that turns /feedback into an agent prompt
"""

import logging

from qwenpaw.plugins.api import PluginApi
from qwenpaw.providers.openai_provider import OpenAIProvider
from qwenpaw.providers.provider import ModelInfo

logger = logging.getLogger(__name__)

# ── AgentScope provider constants ────────────────────────────────────────
_BASE_URL = "https://proxy.agentscope.design/v1"

_DEFAULT_MODELS = [
    ModelInfo(
        id="qwen3.6-plus-dogfooding",
        name="Qwen 3.6 Plus",
        supports_multimodal=True,
        supports_image=True,
        supports_video=False,
    ),
]


class AgentScopeDogfoodingProvider(OpenAIProvider):
    """OpenAI-compatible provider via the AgentScope proxy."""

    @staticmethod
    def get_default_models():
        """Return the pre-defined model list for this provider.

        Returns:
            List of ModelInfo objects.
        """
        return _DEFAULT_MODELS


# ── Bundle plugin ────────────────────────────────────────────────────────


class DogfoodingBundlePlugin:
    """Bundle plugin entry point.

    Registers all three internal-org capabilities with a single
    install / uninstall operation.
    """

    def register(self, api: PluginApi):
        """Register all capabilities bundled in this plugin.

        Args:
            api: PluginApi instance provided by the plugin loader.
        """
        self._register_provider(api)
        self._register_agenttrack_hook(api)
        self._register_feedback_hook(api)
        logger.info("Dogfooding Bundle fully registered")

    # ── provider ──────────────────────────────────────────────────────────

    def _register_provider(self, api: PluginApi):
        """Register the AgentScope Dogfooding LLM provider.

        Args:
            api: PluginApi instance.
        """
        api.register_provider(
            provider_id="agentscope-dogfooding",
            provider_class=AgentScopeDogfoodingProvider,
            label="AgentScope Dogfooding",
            base_url=_BASE_URL,
            chat_model="OpenAIChatModel",
            require_api_key=True,
        )
        logger.info("AgentScope Dogfooding provider registered")

    # ── AgentTrack hook ───────────────────────────────────────────────────

    def _register_agenttrack_hook(self, api: PluginApi):
        """Register the AgentTrack startup hook.

        Args:
            api: PluginApi instance.
        """

        def startup_hook():
            """Initialise AgentTrack at application startup."""
            try:
                logger.info("=== AgentTrack Initialization ===")
                from agenttrack.sdk import AgentTrack

                AgentTrack.init(app_name="qwenpaw")
                logger.info("AgentTrack initialized (app_name=qwenpaw)")
            except ImportError as exc:
                logger.error(
                    f"Failed to import AgentTrack SDK: {exc}. "
                    "Please ensure agenttrack-sdk is installed.",
                    exc_info=True,
                )
            except Exception as exc:
                logger.error(
                    f"Failed to initialize AgentTrack: {exc}",
                    exc_info=True,
                )

        api.register_startup_hook(
            hook_name="agenttrack_init",
            callback=startup_hook,
            priority=0,
        )
        logger.info("AgentTrack startup hook registered")

    # ── /feedback command hook ────────────────────────────────────────────

    def _register_feedback_hook(self, api: PluginApi):
        """Register the /feedback query-rewrite startup hook.

        Args:
            api: PluginApi instance.
        """
        api.register_startup_hook(
            hook_name="feedback_query_rewriter",
            callback=self._patch_query_handler,
            priority=50,
        )
        logger.info("/feedback query-rewrite hook registered")

    def _patch_query_handler(self):
        """Monkey-patch AgentRunner to rewrite /feedback queries."""
        from qwenpaw.app.runner.runner import AgentRunner

        # pylint: disable-next=relative-beyond-top-level
        from .query_rewriter import FeedbackQueryRewriter

        original_query_handler = AgentRunner.query_handler

        async def patched_query_handler(self, msgs, request=None, **kwargs):
            """Patched query handler that rewrites /feedback commands."""
            if msgs:
                last_msg = msgs[-1]
                if hasattr(last_msg, "content"):
                    content_list = (
                        last_msg.content
                        if isinstance(last_msg.content, list)
                        else [last_msg.content]
                    )
                    for content_item in content_list:
                        if (
                            isinstance(content_item, dict)
                            and content_item.get("type") == "text"
                        ):
                            text = content_item.get("text", "")
                            if FeedbackQueryRewriter.should_rewrite(text):
                                rewritten = FeedbackQueryRewriter.rewrite(
                                    text,
                                )
                                logger.info(
                                    f"Rewriting /feedback: "
                                    f"{text[:50]} -> {rewritten[:50]}",
                                )
                                content_item["text"] = rewritten
                                break

            async for result in original_query_handler(
                self,
                msgs,
                request,
                **kwargs,
            ):
                yield result

        AgentRunner.query_handler = patched_query_handler
        logger.info(
            "Patched AgentRunner.query_handler for /feedback command",
        )


plugin = DogfoodingBundlePlugin()
