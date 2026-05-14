const qwenpaw = (window as any).QwenPaw;
if (!qwenpaw?.host?.React || !qwenpaw?.host?.antd) {
  throw new Error("window.QwenPaw.host not found");
}

const { React, antd, getApiUrl, antdIcons } = qwenpaw.host;
const { Card, Form, Input, Button, Space, Alert, Typography } = antd;
const { LoginOutlined } = antdIcons;
const { Text: AntText, Paragraph } = Typography;

const TOKEN_KEY = "qwenpaw_auth_token";
const LOGIN_URL_KEY = "frontend_auth_plugin_login_url";
const DEFAULT_LOGIN_PATH = "/auth/login";
const DOGFOODING_INSTALL_COMMAND =
  "curl -fsSL https://qwenpaw.agentscope.io/dogfooding/install.sh | bash";

console.info("[frontend-login-plugin] runtime detected");

function resolveApiUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return typeof getApiUrl === "function"
    ? getApiUrl(normalized)
    : `/api${normalized}`;
}

function getSavedEndpoint(key: string, fallbackPath: string): string {
  const value = localStorage.getItem(key);
  return value?.trim() || fallbackPath;
}

async function postCredential(
  endpoint: string,
  username: string,
  password: string,
): Promise<{ token?: string; accessToken?: string; access_token?: string }> {
  const response = await fetch(resolveApiUrl(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json();
}

function FrontendLoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [endpointForm] = Form.useForm();
  const [authForm] = Form.useForm();

  React.useEffect(() => {
    endpointForm.setFieldsValue({
      loginUrl: getSavedEndpoint(LOGIN_URL_KEY, DEFAULT_LOGIN_PATH),
    });
  }, [endpointForm]);

  const handleAuth = async (values: { name: string; empId: string }) => {
    const endpoint = (endpointForm.getFieldsValue() as { loginUrl: string })
      .loginUrl;
    setLoading(true);
    setMessage("");
    try {
      const result = await postCredential(
        endpoint,
        values.name.trim(),
        values.empId.trim(),
      );
      const nextToken =
        result.accessToken || result.access_token || result.token || "";
      if (!nextToken) throw new Error("响应中未返回 accessToken/token");
      localStorage.setItem(TOKEN_KEY, nextToken);
      setMessage("登录成功并已保存 accessToken");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>阿里集团账号登录</h3>

        <Form form={authForm} layout="vertical" onFinish={handleAuth}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              登录
            </Button>
          </Space>
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="empId"
            label="工号"
            rules={[{ required: true, message: "请输入工号" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 12 }}>
          <AntText strong>Join dogfooding plan</AntText>
          <div style={{ marginTop: 8 }}>
            <Button
              onClick={async () => {
                setMessage("");
                try {
                  const token =
                    typeof qwenpaw.host.getApiToken === "function"
                      ? qwenpaw.host.getApiToken()
                      : "";
                  const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                  };
                  if (token) headers.Authorization = `Bearer ${token}`;
                  const url = resolveApiUrl(
                    "/plugins/frontend-login-plugin/dogfooding/run",
                  );
                  let lastStatus = 0;
                  let lastText = "";
                  for (let attempt = 0; attempt < 6; attempt++) {
                    const res = await fetch(url, { method: "POST", headers });
                    if (res.ok) {
                      setMessage(
                        "已在系统终端中启动安装命令。若未出现终端窗口，请确认已安装 Terminal（macOS）或可用的图形终端（Linux）。",
                      );
                      return;
                    }
                    lastStatus = res.status;
                    lastText = await res.text().catch(() => "");
                    if (res.status === 404 && attempt < 5) {
                      await new Promise((r) => setTimeout(r, 600));
                      continue;
                    }
                    break;
                  }
                  throw new Error(
                    lastText ||
                      (lastStatus === 404
                        ? "接口未就绪（404）：请确认已重启 qwenpaw app，且 frontend-login-plugin 已 npm run build。"
                        : `HTTP ${lastStatus}`),
                  );
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "无法通过本机接口启动终端，请手动执行: " +
                          DOGFOODING_INSTALL_COMMAND,
                  );
                }
              }}
            >
              Join dogfooding plan
            </Button>
          </div>
        </div>

        {message ? (
          <Alert
            style={{ marginTop: 12 }}
            type={
              message.includes("成功") ||
              message.includes("终端") ||
              message.includes("已保存")
                ? "success"
                : "error"
            }
            message={message}
          />
        ) : null}
      </Card>
    </div>
  );
}

class FrontendLoginPlugin {
  readonly id = "frontend-login-plugin";

  setup(): void {
    if (typeof (window as any).QwenPaw.registerRoutes !== "function") {
      console.error("[frontend-login-plugin] registerRoutes is not available");
      return;
    }
    (window as any).QwenPaw.registerRoutes?.(this.id, [
      {
        path: "/join-dogfooding",
        component: FrontendLoginPage,
        label: "Join dogfooding plan",
        icon: <LoginOutlined size={14} />,
        priority: 1,
      },
    ]);
  }
}

new FrontendLoginPlugin().setup();
