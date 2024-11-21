import React, { Suspense } from "react";
import {
  useNavigate,
  useRoutes,
  useLocation,
} from "react-router-dom";
import zhCN from 'antd/es/locale/zh_CN';
import './App.css';
import Config from "./config";
import { ConfigProvider, Layout, Menu } from "antd";
const { Header, Footer, Sider, Content } = Layout;

const routes = Config.getRoutes();
const menus = Config.getMenus();

// const { routes, menus } = Config.getPageConfig();

function App() {
  const navigate = useNavigate();
  const pageRouter = useRoutes(routes);
  const location = useLocation();

  const curMenu = Config.getCurMenu(location);

  const menuSelect = (menu) => {
    navigate(menu.key);
  }
  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="app">
        <Header className="app-header">
          <div className="app-title">Model Driver App</div>
          <Menu theme="dark" mode="horizontal" selectedKeys={[curMenu?.key]} items={menus} onSelect={menuSelect} />
        </Header>
        <Layout>
          {curMenu?.children?.length &&
            <Sider>
              <Menu style={{ height: '100%' }} items={curMenu.children}  onSelect={menuSelect} />
            </Sider>
          }
          <Layout>
            {/* <Breadcrumb
              style={{
                margin: '16px 0',
              }}
            >
              <Breadcrumb.Item>Home</Breadcrumb.Item>
            </Breadcrumb> */}
            <Content className="app-content">
              <Suspense>
                {pageRouter}
              </Suspense>

            </Content>
          </Layout>

        </Layout>
        {/* <Footer>Footer</Footer> */}
      </Layout>
    </ConfigProvider>

  );
}


export default App;
