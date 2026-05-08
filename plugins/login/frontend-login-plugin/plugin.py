# -*- coding: utf-8 -*-
"""Frontend auth plugin backend stub."""


class FrontendAuthPlugin:
    """No-op backend registration for frontend plugin compatibility."""

    def register(self, api):
        # This plugin only provides frontend UI capabilities.
        # Keep an empty backend entry so plugin loaders that require plugin.py
        # can load this plugin successfully.
        return None


plugin = FrontendAuthPlugin()
