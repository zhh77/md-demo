// 生鲜词库
const FreshProduct = {
    scene: ["fresh"],
    bizTypes : ["productName"], // 关键匹配的bizType，如果匹配,就会根据mockData自动匹配其他字段来生成的数据
    mappings : {          // bizType和mock数据映射关系
        productName: "name",
    },
    mockData: [   // 数据mock
        {
           mainpic: "",
           name: "苹果",
           type: "浄菜",
           category:"水果"
        },
        {
            mainpic: "",
            name: "牛肉",
            type: "原理",
            category:"肉类"
         },
    ],
    mockFields: {    // mock字段的解释，匹配推测规则等, 在自动匹配场景中，会根据配置进行推测
        mainpic: {
            datatype:"image"
        },
        type: {
            biztype:"enum"
        },
        type: {
            category:"enum"
        },
    }
};