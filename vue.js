(function() {
    function Vue(options) {
        this.el = options.el;
        this.data = options.data;
        this.methods = options.methods;
        this.rootEl = document.querySelector(this.el);

        this.bindList = findBindings(this.rootEl, this);

        this.dataBindList = bindData(this);
        this.events = bindEvents(this.rootEl, this);

        init(this);
    }

    function bindData(instance) {
        let data = instance.data;
        let dataToDomList = [];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                var keyDomList = instance.bindList.filter(item => item.field === key);
                if (keyDomList.length) {
                    dataToDomList.push({
                        field: key,
                        domList: keyDomList
                    });
                }
            }
        }

        dataToDomList.forEach(item => {
            (function(field) {
                Object.defineProperty(instance, field, {
                    set(value) {
                        updateDom(item.domList, value);
                        data[field] = value;
                    },
                    get() {
                        return data[field];
                    }
                });

            })(item.field)
        });
    }

    function bindEvents(el, instance) {
        let eventDomList = el.querySelectorAll('[\\@click]');
        Array.from(eventDomList).forEach(dom => {
            let eventMethodName = dom.getAttribute('@click');
            (function(eventMethodName) {
                dom.addEventListener('click', ev => {
                    instance.methods[eventMethodName].apply(instance);
                });
            })(eventMethodName);
        });
    }

    function updateDom(domList, value) {
        domList.forEach(item => {
            if (item.tag === 'div') {
                item.node.innerText = value;
            } else if (item.tag === 'input') {
                item.node.value = value;
            }
        });

    }

    function init(instance) {
        instance.bindList.forEach(item => {
            let value = instance.data[item.field];
            if (item.tag === 'div') {
                item.node.innerText = value;
            } else if (item.tag === 'input') {
                item.node.value = value;
            }
        });
    }

    function findBindings(el, instance) {
        let bindList = [];
        let bindDomList = el.querySelectorAll('[v-text],[v-model]');
        Array.from(bindDomList).forEach(dom => {
            let field = dom.getAttribute('v-text') || dom.getAttribute('v-model');
            bindList.push({
                node: dom,
                tag: dom.tagName.toLowerCase(),
                field: field
            });

            if (dom.getAttribute('v-model')) {
                (function(field) {
                    dom.addEventListener('input', event => {
                        instance[field] = event.target.value;
                    });
                })(field);

            }
        });

        return bindList;
    }

    window.Vue = Vue;
})();