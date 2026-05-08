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
  return typeof getApiUrl === "function" ? getApiUrl(normalized) : `/api${normalized}`;
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
  const [token, setToken] = React.useState(localStorage.getItem(TOKEN_KEY) || "");
  const [endpointForm] = Form.useForm();
  const [authForm] = Form.useForm();

  React.useEffect(() => {
    endpointForm.setFieldsValue({
      loginUrl: getSavedEndpoint(LOGIN_URL_KEY, DEFAULT_LOGIN_PATH),
    });
  }, [endpointForm]);

  const saveEndpoints = (values: { loginUrl: string }) => {
    localStorage.setItem(LOGIN_URL_KEY, values.loginUrl.trim());
    setMessage("接口地址已保存");
  };

  const handleAuth = async (values: { username: string; password: string }) => {
    const endpoint = (endpointForm.getFieldsValue() as { loginUrl: string }).loginUrl;
    setLoading(true);
    setMessage("");
    try {
      const result = await postCredential(endpoint, values.username.trim(), values.password);
      const nextToken = result.accessToken || result.access_token || result.token || "";
      if (!nextToken) throw new Error("响应中未返回 accessToken/token");
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
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

        <Form
          form={endpointForm}
          layout="vertical"
          onFinish={saveEndpoints}
          style={{ marginBottom: 12 }}
        >
          <Form.Item
            name="loginUrl"
            label="登录接口"
            rules={[{ required: true, message: "请输入登录接口地址" }]}
          >
            <Input placeholder="/auth/login 或 https://example.com/login" />
          </Form.Item>
          <Button htmlType="submit">保存接口地址</Button>
        </Form>

        <Form form={authForm} layout="vertical" onFinish={handleAuth}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              登录
            </Button>
            <Button
              danger
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY);
                setToken("");
                setMessage("已清除 accessToken");
              }}
            >
              退出登录
            </Button>
          </Space>
        </Form>

        <div style={{ marginTop: 12 }}>
          <AntText strong>Join dogfooding plan / 加入dogfooding计划</AntText>
          <div style={{ marginTop: 8 }}>
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(DOGFOODING_INSTALL_COMMAND);
                  setMessage(`已复制安装命令，请在终端执行: ${DOGFOODING_INSTALL_COMMAND}`);
                } catch {
                  setMessage(`请手动在终端执行: ${DOGFOODING_INSTALL_COMMAND}`);
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
            type={message.includes("成功") || message.includes("复制") ? "success" : "error"}
            message={message}
          />
        ) : null}

        <div style={{ marginTop: 12 }}>
          <AntText strong>当前 accessToken：</AntText>
          <Paragraph copyable={{ text: token }} style={{ marginBottom: 0 }}>
            {token || "(空)"}
          </Paragraph>
        </div>
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
        path: "/plugin/login",
        component: FrontendLoginPage,
        label: "登录",
        icon: <LoginOutlined  size={18} />,
        priority: 1,
      },
    ]);
  }
}

new FrontendLoginPlugin().setup();
