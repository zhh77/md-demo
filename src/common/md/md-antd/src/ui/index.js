// import './antd';
import React from 'react';
import UIService from 'md-base-ui';

import {
  Input,
  InputNumber,
  DatePicker,
  Radio,
  Select,
  Checkbox,
  // AutoComplete,
  Cascader,
  // Rate,
  // Mentions,
  Switch,
  // Slider,
  TreeSelect,
  // Transfer,
  // TimePicker,
  // Upload,
  Button,
  Row,
  Col,
  // Affix,
  // Breadcrumb,
  // Dropdown,
  // Menu,
  // Pagination,
  // Avatar,
  // Badge,
  // Comment,
  // Collapse,
  // Carousel,
  // Card,
  // Calendar,
  // Descriptions,
  // Empty,
  // List,
  // Popover,
  // Statistic,
  // Tree,
  Tooltip,
  // Timeline,
  // Tag,
  // Tabs,
  // Alert,
  Drawer,
  Modal,
  // message,
  // notification,
  // Progress,
  // Popconfirm,
  // Result,
  Spin,
  // Skeleton,
  // Anchor,
  // BackTop,
  // ConfigProvider,
  Divider,
  // Layout,
  // Typography,
  // Form as AForm,
  // Table as ATable,
  Space,
} from 'antd';


UIService.addUI(Input, 'Input', ['TextArea', 'Search', 'Password']);
UIService.addUI(DatePicker, 'DatePicker', ['RangePicker', 'WeekPicker', 'MonthPicker']);
UIService.addUI(InputNumber, 'InputNumber');
UIService.addUI(Radio, 'Radio', ['Group', 'Button']);
UIService.addUI(Select, 'Select');
UIService.addUI(Checkbox, 'Checkbox', ['Group']);
// UIService.addUI(AutoComplete, 'AutoComplete');
UIService.addUI(Cascader, 'Cascader');
// UIService.addUI(Rate, 'Rate');
// UIService.addUI(Mentions, 'Mentions');
UIService.addUI(Switch, 'Switch');
// UIService.addUI(Slider, 'Slider');
UIService.addUI(TreeSelect, 'TreeSelect');
// UIService.addUI(Transfer, 'Transfer');
// UIService.addUI(TimePicker, 'TimePicker');
// UIService.addUI(Upload, 'Upload');
UIService.addUI(Button, 'Button');
UIService.addUI(Row, 'Row');
UIService.addUI(Col, 'Col');
// UIService.addUI(Affix, 'Affix');
// UIService.addUI(Breadcrumb, 'Breadcrumb', ['Separator']);
// UIService.addUI(Dropdown, 'Dropdown', ['Button']);
// UIService.addUI(Menu, 'Menu', ['Item', 'SubMenu', 'ItemGroup']);
// UIService.addUI(Pagination, 'Pagination');
// UIService.addUI(Avatar, 'Avatar');
// UIService.addUI(Badge, 'Badge');
// UIService.addUI(Comment, 'Comment');
// UIService.addUI(Collapse, 'Collapse', ['Panel']);
// UIService.addUI(Carousel, 'Carousel');
// UIService.addUI(Card, 'Card', ['Grid', 'Meta']);
// UIService.addUI(Calendar, 'Calendar');
// UIService.addUI(Descriptions, 'Descriptions');
// UIService.addUI(Empty, 'Empty');
// UIService.addUI(List, 'List');
// UIService.addUI(Popover, 'Popover');
// UIService.addUI(Statistic, 'Statistic', ['Countdown']);
// UIService.addUI(Tree, 'Tree');
UIService.addUI(Tooltip, 'Tooltip');
// UIService.addUI(Timeline, 'Timeline');
// UIService.addUI(Tag, 'Tag');
// UIService.addUI(Tabs, 'Tabs');
// UIService.addUI(Alert, 'Alert');
// UIService.addUI(Drawer, 'Drawer');
// UIService.addUI(Modal, 'Modal');
// UIService.addUI(message, 'message');
// UIService.addUI(notification, 'Notification');
// UIService.addUI(Progress, 'Progress');
// UIService.addUI(Popconfirm, 'Popconfirm');
// UIService.addUI(Result, 'Result');
UIService.addUI(Spin, 'Spin');
// UIService.addUI(Skeleton, 'Skeleton');
// UIService.addUI(Anchor, 'Anchor');
// UIService.addUI(BackTop, 'BackTop');
// UIService.addUI(ConfigProvider, 'ConfigProvider');
UIService.addUI(Divider, 'Divider');
// UIService.addUI(Layout, 'Layout', ['Sider']);
// UIService.addUI(Typography, 'Typography', ['Text', 'Title', 'Paragraph', 'Link']);
UIService.addUI(Space, 'Space');



import Operations from './operations';
import Form from './form';
import Table from './table';
import MDList from './mdList'
import MDTable from './mdTable';
import MDForm from './mdForm';
import Popup from './popup';
import Wrapper from './decorator/wrapper';
import DecPopup from './decorator/popup';
// import FieldState from './decorator/fieldState';

