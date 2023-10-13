(function (createFactory) {
    createFactory(function(development){
        return (function(){
            // 工具Tool类
            class Tool {
                constructor() {
                    // 纯粹练习一下单例模式
                    if(Tool.instance){
                        return Tool.instance;
                    }
                    Tool.instance = this;
                }
                // 创建节点 createDom
                createDom(obj = {}) {
                    obj = Object.assign({ tag: 'div', text: 'hello', class: [], id: '' }, obj);
                    let node = document.createElement(obj.tag);
                    node.textContent = obj.text;
                    if (obj.class.length > 0) {
                        node.classList.add(...obj.class);
                    }
                    if (obj.id) {
                        node.id = obj.id;
                    }
                    return node;
                }
                // 获取 createDom
                getDom(selector = 'div') {
                    return document.querySelector(selector);
                }

                // 删除 removeDom
                removeDom(obj = {}) {
                    obj = Object.assign({ target: '.item', order: 1 }, obj);
                    // 如果有order,按order删除
                    // 如果没有，删除第一个target
                    let target = this.getDom(obj.target);
                    let parent;
                    try {
                        parent = target.parentElement;

                        let count = 0;
                        parent.childNodes.forEach((e) => {
                            // console.log(target.tagName);
                            if (e.tagName == target.tagName) {
                                count++
                                // console.log(count, obj.order);
                            }
                            if (count == obj.order) {
                                parent.removeChild(e);
                            }
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }
                    return;
                }

                // 清空定时器
                clearTimer(arr = []) {
                    arr.forEach(e => {
                        clearTimeout(e);
                    })
                }
            }
            const tool = new Tool();
            // const tool2 = new Tool();
            class Toastr {
                constructor(options) {
                    this.options = options || {};
                    this.success = this.render;
                    this.dataInit();
                    this.removeContainer();
                }
                // 数据初始化
                dataInit() {
                    this.options = this.getOptions();
                }
                // 获取options
                getOptions() {
                    let ops = Object.assign({}, this.getDefaultOptions(), this.options);
                    if (ops.debug) {
                        this.debugger(ops)
                    }
                    let animation = ops.animation;
                    ops.animation = animation == 1 ? 'opacity' : animation == 2 ? 'move' : animation;
                    return ops;
                }
                // 获取默认options
                getDefaultOptions() {
                    return {
                        debug: false,
                        message: 'hello world',
                        containerId: 'container', //自定义挂载点
                        itemClass: 'item', //自定义类名
                        mountedNode: 'body',
                        position: 'top-right',
                        itemCount: 0,
                        animation: 1,  //1(透明度),2(弹)或者自定义
                        delayTime: 2700,
                        animaTime: 500,
                        itemWidth: '300px',
                        itemHeight: '50px',
                        development
                    }
                }
                // 调试
                debugger(msg) {
                    console.log('MyToastr 调试信息：', msg);
                }
                // 是否有容器节点，没有就创建和挂载，有返回容器节点
                getContainer() {
                    let container = tool.getDom(`#${this.options.containerId}`);
                    if (!container) {
                        container = tool.createDom({ id: [this.options.containerId], text: '' });
                        tool.getDom('body').append(container);
                    }
                    // 无论是否有position，都设置样式。
                    container.classList.add(this.options.position);
                    container.style.position = 'absolute';
                    container.style.zIndex = '999';
                    return container;
                }
                success(message) {
                    this.render(message, "success")
                }
                error(message) {
                    this.render(message, "error")
                }
                info(message) {
                    this.render(message, "info")
                }
                warn(message) {
                    this.render(message, "warn")
                }
                // 渲染函数
                render(message = 'hello', type = "success") {
                    // console.log(type);
                    let item = tool.createDom({ class: [this.options.itemClass, type], text: '' });
                    // 追加动画
                    item.style.animation = `${this.options.animation}Enter ${this.options.animaTime * 0.001}s linear`;
                    item.style.width = this.options.itemWidth;
                    item.style.height = this.options.itemHeight;
                    item.isClose = false;
                    let textNode = tool.createDom({ tag: 'span', text: message, class: ['message'] });
                    let closeBtn = tool.createDom({ tag: 'button', class: ['closeBtn'], text: 'x' });
                    item.append(textNode, closeBtn);
                    this.getContainer().append(item);
                    // 计数器
                    this.options.itemCount++;
                    // 3s后移除, 处理移除动画和移除
                    this.remove(item, { target: `.${this.options.itemClass}` });
                }

                remove(node, objInfo) {
                    let timer1, timer2, that = this;
                    timer1 = setTimeout(() => {
                        node.style.animationName = that.options.animation + 'Leave';
                    }, that.options.delayTime)
                    timer2 = setTimeout(() => {
                        tool.removeDom(objInfo);
                        that.options.itemCount--;
                    }, that.options.delayTime + 300)

                    // 采用轮询机制，每3s查询
                    // 移除父节点,并且移除轮询机器
                    let timer3 = setInterval(() => {
                        if (that.options.itemCount == 0) {
                            that.removeContainer();
                            clearInterval(timer3);
                        }
                    }, 3000)

                    // 鼠标离开
                    node.onmouseleave = function () {
                        if (!this.isClose) {
                            timer1 = setTimeout(() => {
                                node.style.animationName = that.options.animation + 'Leave';
                            }, parseInt(that.options.delayTime / 2.7))
                            timer2 = setTimeout(() => {
                                tool.removeDom(objInfo);
                                that.options.itemCount--;
                            }, parseInt(that.options.delayTime / 2.7) + 300)
                        }

                    }
                    // 鼠标移入
                    node.onmouseenter = () => {
                        tool.clearTimer([timer1, timer2]);
                    }

                    // closebtn
                    node.childNodes[1].onclick = function (e) {
                        node.isClose = true; //阻止点击后鼠标离开事件重新触发。
                        e.stopPropagation(); //阻止事件冒泡
                        shortTime(parseInt(that.options.delayTime / 27), parseInt(that.options.delayTime / 27 + 250));
                    }
                    // 鼠标点击消失
                    node.onclick = function () {
                        this.isClose = true;
                        shortTime(parseInt(that.options.delayTime / 27), parseInt(that.options.delayTime / 27 + 250));
                    }

                    function shortTime(time1, time2) {
                        setTimeout(() => {
                            node.style.animationName = that.options.animation + 'Leave';
                        }, time1)
                        setTimeout(() => {
                            tool.removeDom(objInfo);
                            that.options.itemCount--;
                        }, time2)
                    }
                }
                // 移除父容器
                removeContainer() {
                    let container = this.getContainer();
                    if (container.childNodes.length == 0) {
                        tool.removeDom({ target: `#${this.options.containerId}` });
                    }

                }
            }
            // 返回出去，给立即执行函数暴露一下。
            return Toastr;
        })()
    });
})(function (factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory('Nodejs');
    } else {
        window.Toastr = factory('Browser');
    }
}
);