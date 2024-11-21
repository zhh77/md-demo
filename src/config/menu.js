


import HomePage from "../pages/home";
import AccessPage from "../pages/system/access";
import RolePage from "../pages/system/role";
import SitePage from "../pages/system/site";
import AboutPage from "../pages/about";
// import ModelView from "../pages/editor";
// import ModelEdit from "../pages/editor/edit";


const Menus = [{
  title: '主页',
  name: 'home',
  route: '/',
  element: HomePage,
  menu:true
},
// {
//   title: '编辑器',
//   name: 'editor',
//   route: '/editor/model',
//   menu:true,
//   children:[
//     {
//       title: '模型编辑列表',
//       name: 'model',
//       route: '/editor/model',
//       element: ModelView,
//       menu:true
//     },
//     {
//       title: '模型编辑',
//       name: 'model',
//       route: '/editor/modeledit',
//       element: ModelEdit,
//       menu:true
//     },
//   ]
// },
{
  title: '系统管理',
  name: 'system',
  route: '/system',
  element: RolePage,
  menu:true,
  children:[
    {
      title: '角色管理',
      name: 'role',
      route: '/system',
      menu:true
    },
    {
      title: '权限管理',
      name: 'access',
      route: '/system/access',
      element: AccessPage,
      menu:true
    },
    {
      title: '站点管理',
      name: 'site',
      route: '/system/site',
      element: SitePage,
      menu:true
    },
  ]
},
{
  title: '关于我们',
  name: 'about',
  route: '/about',
  element: AboutPage,
  menu:true
}];

export default Menus;