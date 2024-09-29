
/**
 * 函数防抖
 * @param {Function} fn 需要执行的函数
 * @param {number} wait  检测防抖的间隔频率，单位是毫秒（ms）
 * @param {boolean} immediate 是否立即执行
 * @return {Function} 可被调用执行的函数
 */
export function debounce(fn, wait = 500, immediate = false) {
    let timer = null;
    return function (...args) {
        // 保存当前上下文
        const context = this;
        // 是否立即执行
        if (immediate && !timer) {
            fn.apply(context, args);
        }
        // 函数被调用，清除定时器
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(context, args);
            timer = null;
        }, wait);
    };
}

/**
 * 计算表格高度
 * @param {VueComponent} _this 
 * @param {string} dataName table maxHeight绑定的属性名
 * @param {number} minusHeight 额外要减去的高度
 * @returns {function} 计算剩余可给元素分配的高度函数
 */
const _getTableHeight = (_this, dataName, minusHeight) => {
    return () => {
        const els = _this.$el.children;
        let height = 0;
        Array.from(els).forEach(el => {
            height += el.offsetHeight;
        });
        height -= (_this[dataName] || 0);
        //最小高度为100防止赋值负数导致高度失效
        _this[dataName] = Math.max((window.innerHeight - height - minusHeight), 100);
    }
};

/**
 * 计算表格高度
 * @param {VueComponent} _this 
 * @param {string} dataName maxHeight绑定的属性名 比如 :maxHeight="tableHeight" 那么就传入'tableHeight'
 * @param {number} minusHeight 额外要减去的高度 不传默认100
 */
export function getTableHeight(_this, dataName, minusHeight = 100) {
    const debouncedGetTableHeight = debounce(_getTableHeight(_this, dataName, minusHeight));
    window.addEventListener('resize', debouncedGetTableHeight);
    // 添加事件监听器的清理逻辑
    const cleanup = () => {
        window.removeEventListener('resize', debouncedGetTableHeight);
    };
    // 绑定清理函数到组件销毁事件
    _this.$on('hook:beforeDestroy', cleanup);
    _this.$nextTick(_getTableHeight(_this, dataName, minusHeight));
}

/**
* 给单独容器赋予一个loading加载 
* @param { String } dom_id 需要加载loading的dom元素的id 如 'id'
* @param { String } flag  传入hide或者show hide隐藏loading，show显示loading
*/
export function setLoading(dom_id, flag = 'show') {
    let dom = document.getElementById(dom_id)
    //校验参数
    const isDOM = dom && typeof dom === 'object' && dom.nodeType === 1 && typeof dom.nodeName === 'string';
    if (!isDOM) {
        throw 'function setLoading(dom_id,falg)方法 dom_id参数需传入一个dom元素的id'
    }
    if (flag !== 'hide' && flag !== 'show') {
        throw 'function setLoading(dom,falg)方法 flag参数需传入hide或show'
    }
    //获取body元素
    let body = document.querySelector('body')
    //获取remove元素
    let removeDom = document.getElementById(dom_id + '_container')
    //如果隐藏元素
    if (flag === 'hide') {
        if (!removeDom) return
        body.removeChild(removeDom)
        return
    } else {
        if (removeDom && typeof removeDom === 'object' && removeDom.nodeType === 1 && typeof removeDom.nodeName === 'string') throw '不可传入相同的DOM id'
    }
    //获取要加载loading的dom宽高、位置 赋予loading外部容器
    let container = document.createElement('div')
    //给外部容器设置id,便于删除时通过id找到此dom
    container.setAttribute('id', dom_id + '_container')
    container.style.width = dom.offsetWidth + 'px'
    container.style.height = dom.offsetHeight + 'px'
    container.style.position = 'absolute'
    container.style.zIndex = 999
    container.style.top = dom.offsetTop + 'px'
    container.style.left = dom.offsetLeft + 'px'
    // 设置loading样式
    let loadingBox = document.createElement('div')
    loadingBox.innerHTML =
        ' <p style="font-weight:bold;font-size: 12px;transform: scale(0.7);color: #A2B045;" id="loadingText">Loading</p>'
    loadingBox.style.width = '50px'
    loadingBox.style.height = '50px'
    loadingBox.style.position = 'absolute'
    loadingBox.style.top = '50%'
    loadingBox.style.left = '50%'
    loadingBox.style.transform = 'translate(-50%, -50%)'
    loadingBox.style.border = '5px solid #A2B045'
    loadingBox.style.borderRadius = '50%'
    loadingBox.style.display = 'flex'
    loadingBox.style.justifyContent = 'center'
    loadingBox.style.alignItems = 'center'
    loadingBox.animate(
        [{
            border: '2px solid white'
        },
        {
            border: '10px solid #A2B045',
            offset: 0.5
        },
        {
            border: '2px solid white'
        }
        ], {
        duration: 1000,
        iterations: 'Infinity',
        easing: 'ease-in-out',
    }
    )
    container.appendChild(loadingBox)
    body.appendChild(container)
}