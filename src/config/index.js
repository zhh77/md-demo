//  import {Navigate} from "react-router-dom";
import React from "react";
import './md.config';
import Menus from "./menu";


const { routes, menus } = parsePages(Menus);

const Config = {
  getRoutes() {
    return routes;
  },
  getMenus() {
    return menus.map(item => Object.assign({}, item, { children: null }));
  },
  getCurMenu(routeLocation) {
    if (routeLocation) {
      //根据路由信息获取二级菜单
      let matchLen = 0, curMenu;
      menus.find(item => {
        if (routeLocation.pathname === item.key) {
          curMenu = item;
          return true;
        }

        if (routeLocation.pathname.indexOf(item.key) > -1 && matchLen < item.key.length) {
          matchLen = item.key.length;
          curMenu = item;
        }
        return false;
      });

      return curMenu;
    }
  }
}

// function loadModule(path) {
//   const Module = lazy(() => import(`pages/${path}`));
//   return <Module />;
// }

function parsePages(pages, routes) {
  if (pages.length) {
    if (routes == null) {
      routes = [];
    }
    let menus = [];
    pages.forEach(page => {
      if (page) {
        let { route, children } = page;

        if(page.element) {
          routes.push({
            path: route, key: page.name,
            exact:true,
            element: <page.element /> ,
            // element: page.element ? <page.element /> : loadModule(page.path || page.name),
            // children: children?.routes
          });
        }
        

        if (children) {
          children = parsePages(children, routes);
        }

        page.menu && menus.push({ label: page.title, key: page.route, children: children?.menus });
      }
    })
    return { routes, menus };
  }
}

// function Redirect (props) {
//   return <Navigate to={props.to}></Navigate>
// }

export default Config;
