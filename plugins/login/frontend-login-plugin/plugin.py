# -*- coding: utf-8 -*-
"""Frontend login plugin backend: mounts API to launch dogfooding install in OS terminal."""

from __future__ import annotations

import logging
import shlex
import subprocess
import sys

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)

DOGFOODING_INSTALL_COMMAND = (
    "curl -fsSL https://qwenpaw.agentscope.io/dogfooding/install.sh | bash"
)

_dogfooding_route_mounted = False


def _popen_terminal(argv: list[str] | None = None, *, shell_cmd: str | None = None) -> None:
    """Spawn helper; discard child stdout/stderr (e.g. osascript prints tab id to stdout)."""
    kwargs: dict = {
        "stdout": subprocess.DEVNULL,
        "stderr": subprocess.DEVNULL,
        "start_new_session": True,
    }
    if argv is not None:
        subprocess.Popen(argv, **kwargs)
    elif shell_cmd is not None:
        subprocess.Popen(shell_cmd, shell=True, **kwargs)
    else:
        raise ValueError("argv or shell_cmd required")


def _open_terminal_with_command(cmd: str) -> None:
    """Best-effort: open a visible terminal window and run *cmd*."""
    if sys.platform == "darwin":
        safe = cmd.replace("\\", "\\\\").replace('"', '\\"')
        applescript = f'tell application "Terminal" to do script "{safe}"'
        _popen_terminal(["osascript", "-e", applescript])
    elif sys.platform == "win32":
        _popen_terminal(shell_cmd=f'start "QwenPaw dogfooding" cmd /k {cmd}')
    else:
        candidates: list[list[str]] = [
            ["gnome-terminal", "--", "bash", "-lc", cmd],
            ["konsole", "-e", "bash", "-lc", cmd],
            ["x-terminal-emulator", "-e", f"bash -lc {shlex.quote(cmd)}"],
        ]
        for argv in candidates:
            try:
                _popen_terminal(argv)
                return
            except FileNotFoundError:
                continue
        _popen_terminal(["/bin/bash", "-lc", cmd])


def _mount_dogfooding_route() -> None:
    global _dogfooding_route_mounted
    if _dogfooding_route_mounted:
        return

    from qwenpaw.app._app import app

    router = APIRouter()

    @router.post("/plugins/frontend-login-plugin/dogfooding/run")
    async def dogfooding_run_in_terminal():
        try:
            _open_terminal_with_command(DOGFOODING_INSTALL_COMMAND)
            return {"ok": True}
        except Exception as exc:  # noqa: BLE001
            logger.exception("dogfooding terminal launch failed")
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    app.include_router(router, prefix="/api")
    _dogfooding_route_mounted = True
    logger.info("[frontend-login-plugin] mounted POST /api/plugins/frontend-login-plugin/dogfooding/run")


class FrontendAuthPlugin:
    """Mounts dogfooding terminal API as soon as the plugin registers (avoids race before startup hooks)."""

    def register(self, api):
        _mount_dogfooding_route()
        return None


plugin = FrontendAuthPlugin()
