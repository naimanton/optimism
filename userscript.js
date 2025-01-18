// ==UserScript==
// @name         optimism: cdek/contact-centre
// @namespace    http://tampermonkey.net/
// @version      25.01.04
// @description  workflow optimisation for ek5 and contact-centre
// @author       Ton
// @run-at       document-start
// @match        https://ek5.cdek.ru/*
// match        https://svvs.contact-centre.ru/*
// @match        https://preorderec5.cdek.ru/*
// @match        https://calltaskfrontng.cdek.ru/*
// @match        https://singleadvicewindowng.cdek.ru/*
// @match        https://smartadvicewindowng.cdek.ru/*
// @match        https://messagerequestscreateformng.cdek.ru/*
// @match        https://companystructurefrontng.cdek.ru/*
// @match        https://coworker.cdek.ru/*
// @match        https://orderec5ng.cdek.ru/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValues
// @grant        GM_notification
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==
const context = {
    domain: null,
    userscriptInjectionTimestamp: Date.now(),
};
const storage = {
    getValue(name) {
        return GM_getValue(name);
    },
    setValue(name, value) {
        GM_setValue(name, value);
    },
    getValueJSON(name) {
        const value = GM_getValue(name);
        return JSON.parse(value);
    },
    setValueJSON(name, object) {
        GM_setValue(name, JSON.stringify(object));
    },
    editObject(name, callback) {
        const object = storage.getValueJSON(name);
        callback(object);
        storage.setValueJSON(name, object);
    },
    defineValueJSON(name, onlyIfUndefined, object) {
        if (!onlyIfUndefined || storage.getValue(name) === undefined) {
            storage.setValueJSON(name, object);
        }
    },
    mount(onlyIfUndefined=true) {
        storage.defineValueJSON('usercfg', onlyIfUndefined, {

        });
        storage.defineValueJSON('smartAdviceWindow', onlyIfUndefined, {
            orderClientsExtraData: [],
        });
    },
    getAll() {
        const result = {};
        for (let name of GM_listValues()) {
            result[name] = storage.getValueJSON(name);
        }
        return result;
    },
    clear() {
        GM_deleteValues(GM_listValues());
    },
};
const usercfg = {
    data: null,
    loadFromStorage() {
        const usercfgValue = GM_getValue('usercfg');
        if (usercfgValue === undefined) {
            usercfg.data = {};
            return;
        }
        usercfg.data = JSON.parse(usercfgValue);
    },
    save() {
        GM_setValue('usercfg', JSON.stringify(usercfg.data));
    },
};
const cfg = {
    domainWhiteList: [
        'svvs.contact-centre.ru', 'ek5.cdek.ru', 'preorderec5.cdek.ru', 'singleadvicewindowng.cdek.ru', 'smartadvicewindowng.cdek.ru',
        'messagerequestscreateformng.cdek.ru', 'companystructurefrontng.cdek.ru', 'coworker.cdek.ru', 'calltaskfrontng.cdek.ru', 'orderec5ng.cdek.ru'
    ],
    xhrInterceptingDomainWhiteList: [
        'singleadvicewindowng.cdek.ru', 'smartadvicewindowng.cdek.ru', 
        'messagerequestscreateformng.cdek.ru', 'calltaskfrontng.cdek.ru',
    ],
    color: {
        softYellow: '#fff8e1',
        softOrange: '#ffe2b7',
        orange: '#ffa000',
        bluegreen: '#069697',
        bluegray: '#E8F1FC',
    },
    exception: {
        titles: {

        },
    },
};
const control = {
    l: console.log,
    qw: console.log,
    affirm(boolean, message) {
        if (boolean) return;
        throw new Error(message);
    },
    claim(assertionMethod, item) {
        affirm(assertionMethod(item), 'Type error in claim()');
        return item;
    },
    async attempt(tryCallback, catchCallback) {
        try {
            await tryCallback();
        } catch (error) {
            await catchCallback(error);
        }
    },
    addSafeListener(element, eventType, title, callback) {
        return element.addEventListener(
            eventType, event => {
                attempt(() => callback(event), tools.defaultCatchCallback.bind(tools, title));
            }
        );
    },
    addSafeObserver(element, options, title, callback) {
        const mo = new MutationObserver((records, mo) => {
            attempt(() => callback(records, mo), tools.defaultCatchCallback.bind(tools, title));
        });
        mo.observe(element, options);
        return mo;
    },
    setSafeInterval(title, callback, intervalMs) {
        return setInterval(attempt.bind(null, callback, tools.defaultCatchCallback.bind(tools, title)), intervalMs);
    },
    until(method, intervalMs = 1000) {
        return new Promise(function(resolve, reject) {
            if (method()) {
                resolve();
                return;
            }
            let counter = 0;
            const intervalId = setInterval(function() {
                if (++counter > 60) {
                    clearInterval(intervalId);
                    reject(new Error('Превышено время ожидания until.'));
                }
                console.log('until');
                if (!method()) return;
                clearInterval(intervalId);
                resolve();
            }, intervalMs);
        });
    },
    pollingSelector(element, selector, intervalMs = 1000) {
        return new Promise(function(resolve, reject) {
            const resultElement = element.querySelector(selector);
            if (resultElement !== null) {
                resolve(resultElement);
                return;
            }
            let counter = 0;
            const intervalId = setInterval(function() {
                if (++counter > 60) {
                    clearInterval(intervalId);
                    reject(new Error('Превышено время ожидания pollingSelector: ' + selector));
                }
                console.log('optimism polling selector: ', selector)
                const resultElement = element.querySelector(selector);
                if (resultElement === null) return;
                clearInterval(intervalId);
                resolve(resultElement);
            }, intervalMs);
        });
    },
    pollingSelectorAll(element, selector, len = 1, intervalMs = 1000) {
        return new Promise(function(resolve, reject) {
            const resultCollection = element.querySelectorAll(selector);
            if (resultCollection.length >= len) {
                resolve(resultCollection);
                return;
            }
            let counter = 0;
            const intervalId = setInterval(function() {
                if (++counter > 60) {
                    clearInterval(intervalId);
                    reject(new Error('Превышено время ожидания pollingSelectorAll: ' + selector));
                }
                console.log('optimism polling selector all: ', selector)
                const resultCollection = element.querySelectorAll(selector);
                if (resultCollection.length < len) return;
                clearInterval(intervalId);
                resolve(resultCollection);
            }, intervalMs);
        });
    },
};
const {
    l, qw, affirm, claim, attempt, addSafeListener, addSafeObserver, 
    setSafeInterval, until, pollingSelector, pollingSelectorAll,
} = control;
const type = {
    of: item => Object.prototype.toString.call(item).toLowerCase(),
    element: item => item instanceof Element,
    nodeList: item => type.of(item) === '[object nodelist]',
    htmlCollection: item => type.of(item) === '[object htmlcollection]',
    tableSectionElement: item => type.of(item) === '[object htmltablesectionelement]',
    object: item => type.of(item) === '[object object]',
    string: item => type.of(item) === '[object string]',
    notEmptyString: item => type.of(item) === '[object string]' && item.length > 0,
    orderIDstring: item => type.string(item) && isFinite(item),
};
const tools = {
    defaultCatchCallback(title, error) {
        const text = "Ошибка в пользовательском скрипте > " + title;
        tools.showError(text + ' > ' + error.message)
        console.warn(text + ":\n\n" + error.stack);
    },

    pause(intervalMs) {
        return new Promise(resolve => {
            setTimeout(resolve, intervalMs);
        });
    },
    async runScriptIfActiveInUsercfg(title, scriptname, callback) {
        if (usercfg.data[scriptname] === undefined ||
            (usercfg.data[scriptname] && usercfg.data[scriptname].active !== false)
        ) {
            await attempt(callback, tools.defaultCatchCallback.bind(tools, title));
        }
    },
    dispatchEKtabClosingEvent() {
        GM_setValue('closeEKtab', 'active');
    },
    getAuthToken() {
        return claim(type.notEmptyString, GM_getValue('authToken'));
    },
    _showNotification(message, backgroundColor) {
        const notificationContainer = document.getElementById('optimismNotificationContainer');
        const notificationPopup = document.createElement('div');
        notificationPopup.style.backgroundColor = backgroundColor;
        notificationPopup.className = 'optimism-notification-popup';
        notificationPopup.textContent = message;
        // Добавляем класс для отображения
        setTimeout(() => {
            notificationPopup.classList.add('show');
        }, 10);
        // Удаляем уведомление через 3 секунды
        //setTimeout(() => {
        //errorPopup.classList.remove('show');
        //setTimeout(() => errorPopup.remove(), 300); // Убираем из DOM после анимации
        //}, 5000);
        // Добавляем уведомление в контейнер
        notificationContainer.appendChild(notificationPopup);
    },
    showError(message, color='#ffe2b7') {
        tools._showNotification(message, color);
    },
    showMessage(message, color='#BFD641') {
        tools._showNotification(message, color);
    },
    getNumberOfCost(costString) {
        const dotified = costString.replace(',', '.');
        let result = '', valid = '0123456789.';
        for (var sym of dotified) {
           if (valid.includes(sym)) result += sym;
        }
        return +result;
    },
    getOfficeCodeSubstr(string) {
        const m = string.match(/[A-Z]+\d+/);
        if (m === null) return false;
        return m[0];
    },
};
const xhr = {
    _XMLHttpRequest: unsafeWindow.XMLHttpRequest,
    Interceptor: class {
        constructor(...args) {
            const instance = new xhr._XMLHttpRequest(...args);
            addSafeListener(
                instance, 'loadend', 'XMLHttpRequest (событие loadend)', 
                xhr.loadendEvent.bind(xhr, instance)
            );
            return instance; 
        }
    },
    establishXHRinterceptor() {
        const isXHRinterceptingDomain = cfg.xhrInterceptingDomainWhiteList.includes(context.domain);
        // подмена класса XHR на перехватчик
        if (isXHRinterceptingDomain) unsafeWindow.XMLHttpRequest = xhr.Interceptor;
    },
    loadendEvent(instance) {
        if (instance.responseURL.includes('get-order-clients')) {
            tools.runScriptIfActiveInUsercfg('ЕОК-smart: сохранение подробностей о клиентах', 'eokSmart-orderClientsResponseDataSaving', eok.saveOrderClientsResponseData.bind(eok, instance));
        }
    },
};
const main = {
    async run() {
        context.domain = main.getDomainFromWhiteList(location.href, 'domainWhiteList');
        if (context.domain === false) return;
        usercfg.loadFromStorage();
        storage.mount(true);
        tools.runScriptIfActiveInUsercfg('Перехват запрсосов', 'XHRinterceptor', xhr.establishXHRinterceptor.bind(xhr));
        // tooltip.injectCSS();
        ctxmenu.injectCSS();
        //menu0.injectCSS();
        main.injectNotificationCSS();
        await main.injectNotificationDiv();
        await main.manageScripts(context.domain);
    },
    injectSingleAdviceWindowCSS() {
        GM_addStyle(`
            optimism-opacity-hover:hover {
                opacity: 0.7;
            }
        `);
    },
    async injectNotificationDiv() {
        const body = claim(type.element, await pollingSelector(document, 'body'));
        body.insertAdjacentHTML('beforeend', '<div id="optimismNotificationContainer" class="optimism-notification-container"></div>')
        const optimismNotificationContainer = document.querySelector('#optimismNotificationContainer');
        addSafeListener(optimismNotificationContainer, 'click', 'Контейнер уведомлений (удаление уведомлений кликом)', () => {
            //for (let popup of optimismErrorContainer.children) {
            //popup.classList.remove('show');
            //}
            optimismNotificationContainer.innerHTML = '';
        });
    },
    injectNotificationCSS() {
        GM_addStyle(`
        .optimism-notification-container {
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        }
        .optimism-notification-popup {
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            font-size: 16px;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .optimism-notification-popup.show {
            opacity: 1;
            transform: translateX(0);
        }
    `);
    },
    setLocalStorageAuthTokenToGMstorage() {
        GM_setValue('authToken', claim(type.notEmptyString, localStorage.getItem('pwt')));
    },
    async manageScripts(domain) {
        if (domain === 'svvs.contact-centre.ru') {
            // svvs.establishAutoupdate();
        } else if (domain === 'ek5.cdek.ru') {
            GM_setValue('closeEKtab', null);
            // main.setLocalStorageAuthTokenToGMstorage();
            await menu.establish();
            await tools.runScriptIfActiveInUsercfg('ЭК5 (закрытие вкладок)', 'EKtabClosingEventListener', ek5.establishEKtabClosingEventListener.bind(ek5));
        } else if (domain === 'smartadvicewindowng.cdek.ru') {
            /* есть скрипт в перехвате запросов */
        } else if (domain === 'singleadvicewindowng.cdek.ru') {
            // main.injectSingleAdviceWindowCSS();
            if (!location.href.includes('smartAdviceWindow')) { // старый ЕОК
                await until(() => type.element(document.body));
                tools.showMessage('Рекомендация для старого ЕОК: Откройте любой заказ в течение минуты для корректной работы пользовательского скрипта. Например: 10051234567');
            }
            await tools.runScriptIfActiveInUsercfg('ЕОК (открытие областей оплаты и истории мест)', 'collapsedAreasAutoOpening', eok.establishCollapsedAreasAutoOpening.bind(eok));
            await tools.runScriptIfActiveInUsercfg('ЕОК (окрашивание многоместных селектов)', 'multiplePlacesMarking', eok.markMultiplePlaces2.bind(eok));
            await tools.runScriptIfActiveInUsercfg('ЕОК (открытие вкладки сообщений-запросов)', 'notificationBlockMessagerequestTabAutoOpening', eok.establishNotificationBlockMessagerequestTabAutoOpening.bind(eok));
            await tools.runScriptIfActiveInUsercfg('ЕОК (кастомное контекстное меню)', 'eokContextMenuOnLinks', eok.establishContextMenuOnLinks.bind(eok));
            if (location.href.includes('smartAdviceWindow')) {
                await tools.runScriptIfActiveInUsercfg('ЕОК (подсказки с подробностями о клиентах)', 'eokOrderClientsExtraDataTooltips', eok.establishOrderClientsExtraDataTooltips.bind(eok));
            }           
        } else if (domain === 'preorderec5.cdek.ru' && !location.href.includes('gate.html')) {
            if (location.href.includes('journal')) {
                await tools.runScriptIfActiveInUsercfg('Журнал заявок (очистка фильтра)', 'requestFilterReset', preorder.resetRequestFilter.bind(preorder));
                //const splittedHref = location.href.split('/');
                //const item = splittedHref.pop(); // id or string
                //if (!isFinite(item)) return;
                //await tools.runScriptIfActiveInUsercfg('requestFilterValueSet', preorder.setFilterValue.bind(preorder, item));
            } else {

            }
        } else if (domain === 'calltaskfrontng.cdek.ru') {
            await tools.runScriptIfActiveInUsercfg('ДЗНП (автоматическое закрытие раздела после нажатия Сохранить)', 'calltaskSaveButtonTabAutoClosing', calltask.establishSaveButtonTabAutoClosing.bind(calltask));
        } else if (domain === 'messagerequestscreateformng.cdek.ru') {
            await tools.runScriptIfActiveInUsercfg('Форма создания СЗ (автовыбор ветви)', 'messagerequestDefaultBranchChoosing', messagerequest.establishDefaultBranchChoosing.bind(messagerequest));
            // await tools.runScriptIfActiveInUsercfg('Форма создания СЗ (закрытие активной вкладки кнопками Отправить/Закрыть)', 'messagerequestCreateFormCompleteButtonsTabAutoClosing', messagerequest.establishCreateFormCompleteButtonsTabAutoClosing.bind(messagerequest));
        } else if (domain === 'companystructurefrontng.cdek.ru') {
            await tools.runScriptIfActiveInUsercfg('Офисы (Enter в поле кода офиса нажимает Найти и очищает фильтр)', 'companystructureEnterKeyExtraListener', companystructure.establishEnterKeyExtraListener.bind(companystructure));
        } else if (domain === 'coworker.cdek.ru') {
            await tools.runScriptIfActiveInUsercfg('Сотрудник (Enter в поле кода офиса выбирает 1-ый офис, нажимает Найти и очищает фильтр)', 'coworkerEnterKeyExtraListener', coworker.establishEnterKeyExtraListener.bind(coworker));
        } else if (domain === 'orderec5ng.cdek.ru') {
            if (location.href.includes('create') || location.href.includes('open')) {
                await tools.runScriptIfActiveInUsercfg('Создание/редактирование заказа (предупреждение: обрешетка увеличивает срок доставки на 1 день)', 'orderec5LathingExtraDeliveryDayNotification', orderec5.establishLathingExtraDeliveryDayNotification.bind(orderec5));
                await tools.runScriptIfActiveInUsercfg('Создание/редактирование заказа: авиапризнаки запоминаются в подсказки', 'orderec5TransportSchemeMemorization', orderec5.establishTransportSchemeMemorization.bind(orderec5));
                await tools.runScriptIfActiveInUsercfg('Создание/редактирование заказа: разность сумм при внесении изменений', 'orderec5SumDifferenceCalculation', orderec5.establishSumDifferenceCalculation.bind(orderec5));
            }
        }
    },
    getDomainFromWhiteList(url, listName) {
        for (let domain of cfg[listName]) {
            if (url.includes(domain)) return domain;
        }
        return false;
    },
};
const menu = {
    establish() {
        addSafeListener(document, 'keydown', 'ЭК5 (меню юзерскрипта)', event => {
            if (!event.altKey || event.key !== 'End' || event.repeat) return;
            const mainChoice = menu.prompt(['Активация/деактивация скриптов', 'Настройки', 'Лог хранилища в консоль', 'Лечение хранилища']);
            if (mainChoice === null) return
            if (mainChoice === 1) {
                menu.scriptToggling();
                return;
            }
            if (mainChoice === 2) {
                menu.settings();
                return;
            }
            if (mainChoice === 3) {
                console.log( storage.getAll() );
                return;
            }
            if (mainChoice === 4) {
                const choice = menu.prompt(['Монтировать хранилище без очистки (немонтируемые данные останутся без изменений)', 'Очистить хранилище и монтировать']);
                const confirmed = confirm('Точно?');
                if (!confirmed || choice === 0) return;
                if (choice === 2) {
                    storage.clear();
                }
                storage.mount(false);
                return;
            }
        });
    },
    settings() {
        const scriptChoice = menu.prompt(['Форма создания СЗ']);
        if (scriptChoice === 0) return;
        if (scriptChoice === 1) {
            const setting = menu.prompt(['Метод открытия меню шаблонов']);
            if (setting === 0) return;
            if (setting === 1) {
                const way = menu.prompt(['Двойной клик', 'Alt + Двойной клик', 'Ctrl + Двойной клик']);
                if (way === 0) return;
                if (usercfg.data.settings === undefined) {
                    usercfg.data.settings = {};
                }
                if (usercfg.data.settings['messagerequestDefaultBranchChoosing'] === undefined) {
                    usercfg.data.settings['messagerequestDefaultBranchChoosing'] = {};
                }
                usercfg.data.settings['messagerequestDefaultBranchChoosing'].menuOpeningWay = way;
                usercfg.save();
                alert('Для применения изменений обновите страницу.');
            }
        }
    },
    scriptToggling() {
        const scriptChoice = menu.prompt([
            menu.get_isActive_prefix('XHRinterceptor') + 'Перехват запросов',
            menu.get_isActive_prefix('EKtabClosingEventListener') + 'ЭК5: Закрывать вкладки, если они просят закрытия',
            menu.get_isActive_prefix('eokSmart-orderClientsResponseDataSaving') + 'ЕОК-smart: сохранение подробностей о клиентах',
            menu.get_isActive_prefix('eokOrderClientsExtraDataTooltips') + 'ЕОК: подсказки с подробностями о клиентах',
            menu.get_isActive_prefix('collapsedAreasAutoOpening') + 'ЕОК: Автоматическое открытие областей об оплате и грузоместах',
            menu.get_isActive_prefix('multiplePlacesMarking') + 'ЕОК: Окрашивание селекта мест, если в заказе более 1 места',
            menu.get_isActive_prefix('notificationBlockMessagerequestTabAutoOpening') + 'ЕОК: Автоматическое открытие вкладки сообщений-запросов',
            menu.get_isActive_prefix('eokContextMenuOnLinks') + 'ЕОК: Контекстное меню для копирования текста ссылочных элементов',
            menu.get_isActive_prefix('requestFilterReset') + 'Журнал заявок: Автоматический сброс фильтров',
            menu.get_isActive_prefix('requestFilterValueSet') + '[Не доступен] Журнал заявок: Инъекция идентификатора заявки в поле фильтра',
            menu.get_isActive_prefix('messagerequestDefaultBranchChoosing') + 'Форма создания СЗ: Alt + Двойной клик открывает меню выбора ветви',
            menu.get_isActive_prefix('messagerequestCreateFormCompleteButtonsTabAutoClosing') + '[Не доступен] Форма создания СЗ: Отправка/закрытие формы закрывает вкладку Сообщения-запросы',
            menu.get_isActive_prefix('companystructureEnterKeyExtraListener') + 'Офисы: Enter в фильтре по коду офиса производит поиск и очищает фильтр',
            menu.get_isActive_prefix('coworkerEnterKeyExtraListener') + 'Сотрудник: Enter в фильтре по коду офиса выбирает 1-ый офис, производит поиск и очищает фильтр',
            menu.get_isActive_prefix('calltaskSaveButtonTabAutoClosing') + 'ДЗНП: автоматическое закрытие раздела после нажатия Сохранить',
            menu.get_isActive_prefix('orderec5LathingExtraDeliveryDayNotification') + 'Создание/редактирование заказа: предупреждение: обрешетка увеличивает срок доставки на 1 день',
            menu.get_isActive_prefix('orderec5TransportSchemeMemorization') + 'Создание/редактирование заказа: авиапризнаки запоминаются в подсказки',
            menu.get_isActive_prefix('orderec5SumDifferenceCalculation') + 'Создание/редактирование заказа: разность сумм при внесении изменений',
        ]);
        if (scriptChoice === 0) return;
        menu.toggleScriptInUsercfg(scriptChoice);
        alert('Для применения изменений обновите страницу.');
    },
    toggleScriptInUsercfg(n) {
        n--;
        const scriptNames = [
            'XHRinterceptor', 'EKtabClosingEventListener', 'eokSmart-orderClientsResponseDataSaving', 
            'eokOrderClientsExtraDataTooltips', 'collapsedAreasAutoOpening', 'multiplePlacesMarking',
            'notificationBlockMessagerequestTabAutoOpening', 'eokContextMenuOnLinks', 'requestFilterReset',
            'requestFilterValueSet', 'messagerequestDefaultBranchChoosing', 
            'messagerequestCreateFormCompleteButtonsTabAutoClosing','companystructureEnterKeyExtraListener', 
            'coworkerEnterKeyExtraListener', 'calltaskSaveButtonTabAutoClosing',
            'orderec5LathingExtraDeliveryDayNotification', 'orderec5TransportSchemeMemorization', 
            'orderec5SumDifferenceCalculation',
        ];
        affirm(scriptNames.length > n, 'scriptNames содержит меньше имен, чем параметр n');
        if (usercfg.data[scriptNames[n]] === undefined) {
            usercfg.data[scriptNames[n]] = {};
        }
        if (usercfg.data[scriptNames[n]].active === false) {
            usercfg.data[scriptNames[n]].active = true;
        } else {
            usercfg.data[scriptNames[n]].active = false;
        }
        usercfg.save();
    },
    prompt(options) {
        var text = 'Введите номер пункта, который нужно выполнить:\n\n';
        var n = 1;
        for (var option of options) {
            text += '- ' + n + ') ' + option + ';\n';
            n++;
        }
        console.log(text)
        var choice;
        for (;;) {
            choice = prompt(text);
            var nchoice = +choice;
            var isValidChoice = (
                nchoice > 0 && nchoice <= options.length &&
                Number.isInteger(nchoice)
            );
            if (choice === null || isValidChoice) break;
        }
        return +choice;
    },
    get_isActive_prefix(name) {
        if (type.object(usercfg.data[name]) && usercfg.data[name].active === false) {
            return '[<Выключен] ';
        }
        return '[>Включен] ';
    },
};
const tooltip = {
    establish(element, textOrMethod, preferredPosition = 'top') {
        let method;
        if (type.string(textOrMethod)) method = () => textOrMethod;
        else method = textOrMethod;
        const tip = new tooltip.Tooltip();
        tip.listeners = {};
        tip.listeners.enter = addSafeListener(element, 'mouseenter', 'Всплывающая подсказка (showTooltip)', () => {
            tip.showTooltip(element, method(), preferredPosition);
        });
        tip.listeners.leave = addSafeListener(element, 'mouseleave', 'Всплывающая подсказка (hideTooltip)', () => {
            tip.hideTooltip();
        });
        return tip;
    },
    unlisten(tip) {
        removeEventListener(tip.listeners.enter);
        removeEventListener(tip.listeners.leave);
    },
    Tooltip: class Tooltip {
        constructor() {
            this.tooltip = null;
            this.arrow = null;
        }
        createTooltip(content) {
            // Создаем контейнер тултипа
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'optimism-tooltip';
            this.tooltip.textContent = content;
            // Создаем стрелку
            this.arrow = document.createElement('div');
            this.arrow.className = 'optimism-tooltip-arrow';
            // Добавляем стрелку в тултип
            this.tooltip.appendChild(this.arrow);
            // Добавляем тултип в body
            document.body.appendChild(this.tooltip);
        }
        getBestPosition(targetElement, tooltipRect, preferredPosition) {
            const rect = targetElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const arrowSize = 8; // Размер стрелки
            const positions = {
                top: {
                    top: rect.top - tooltipRect.height - arrowSize,
                    left: rect.left + (rect.width - tooltipRect.width) / 2,
                    arrow: {
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
                        borderColor: `#333 transparent transparent transparent`
                    }
                },
                bottom: {
                    top: rect.bottom + arrowSize,
                    left: rect.left + (rect.width - tooltipRect.width) / 2,
                    arrow: {
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
                        borderColor: `transparent transparent #333 transparent`
                    }
                },
                left: {
                    top: rect.top + (rect.height - tooltipRect.height) / 2,
                    left: rect.left - tooltipRect.width - arrowSize,
                    arrow: {
                        top: '50%',
                        left: '100%',
                        transform: 'translateY(-50%)',
                        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
                        borderColor: `transparent transparent transparent #333`
                    }
                },
                right: {
                    top: rect.top + (rect.height - tooltipRect.height) / 2,
                    left: rect.right + arrowSize,
                    arrow: {
                        top: '50%',
                        left: '-8px',
                        transform: 'translateY(-50%)',
                        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
                        borderColor: `transparent #333 transparent transparent`
                    }
                }
            };
            // Проверяем, подходит ли предпочтительная позиция
            const position = positions[preferredPosition];
            if (
                position.top >= 0 && position.left >= 0 &&
                position.left + tooltipRect.width <= viewportWidth &&
                position.top + tooltipRect.height <= viewportHeight
            ) {
                return {
                    position,
                    alignment: preferredPosition
                };
            }
            // Если предпочтительная позиция не подходит, выбираем первую доступную
            for (const key of Object.keys(positions)) {
                const fallbackPosition = positions[key];
                if (
                    fallbackPosition.top >= 0 &&
                    fallbackPosition.left >= 0 &&
                    fallbackPosition.left + tooltipRect.width <= viewportWidth &&
                    fallbackPosition.top + tooltipRect.height <= viewportHeight
                ) {
                    return {
                        position: fallbackPosition,
                        alignment: key
                    };
                }
            }
            // Если ни одна позиция не подходит, возвращаем предпочтительную
            return {
                position,
                alignment: preferredPosition
            };
        }
        showTooltip(targetElement, content, preferredPosition = 'top') {
            if (!this.tooltip) this.createTooltip(content);
            const tooltipRect = this.tooltip.getBoundingClientRect();
            const {
                position,
                alignment
            } = this.getBestPosition(targetElement, tooltipRect, preferredPosition);
            // Устанавливаем позицию тултипа
            this.tooltip.style.top = `${position.top}px`;
            this.tooltip.style.left = `${position.left}px`;
            this.tooltip.style.opacity = '1';
            // Настраиваем стрелку
            Object.assign(this.arrow.style, position.arrow);
            // Сохраняем текущую сторону для отладки
            this.tooltip.dataset.alignment = alignment;
        }
        hideTooltip() {
            if (this.tooltip) {
                this.tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (this.tooltip) {
                        document.body.removeChild(this.tooltip);
                        this.tooltip = null;
                        this.arrow = null;
                    }
                }, 200);
            }
        }
    },
    injectCSS() {
        GM_addStyle(`
      .optimism-tooltip {
            position: absolute;
            background-color: #333;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .optimism-tooltip-arrow {
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
        }
       `);
    },
};
const ctxmenu = {
    ContextMenu: class {
        constructor(selector, menuItems) {
            this.ctxmenuEvent = null;
            this.menuItems = menuItems;
            this.menuElement = this.createMenu();
            this.attachMenu(selector);
        }
        // Создаем DOM-структуру меню
        createMenu() {
            const menu = document.createElement('ul');
            menu.className = 'optimism-context-menu';

            this.menuItems.forEach(item => {
                const menuItem = document.createElement('li');
                menuItem.textContent = item.label;
                addSafeListener(menuItem, 'click', 'Действие в контекстном меню', item.action.bind(this));
                menu.appendChild(menuItem);
            });

            document.body.appendChild(menu);
            return menu;
        }
        // Показываем меню
        showMenu(event) {
            event.stopPropagation();
            event.preventDefault();
            this.ctxmenuEvent = event;
            this.menuElement.style.display = 'block';
            this.menuElement.style.left = `${event.pageX}px`;
            this.menuElement.style.top = `${event.pageY}px`;
        }
        // Скрываем меню
        hideMenu() {
            this.menuElement.style.display = 'none';
        }
        // Добавляем обработчики событий
        attachMenu(selector) {
            addSafeListener(document, 'click', 'Скрытие контекстного меню', () => this.hideMenu());
            addSafeListener(document, 'contextmenu', 'Открытие контекстного меню', event => {
                event
                if (event.ctrlKey && !event.repeat) return; // Ctrl+RMB открывает стандартное контекстное меню (на случае если в ЭК5 введут тоже меню)
                // Проверяем, вызвано ли меню на нужном элементе
                if (event.target.closest(selector)) this.showMenu(event);
                else this.hideMenu();
            });
        }
    },
    injectCSS() {
        GM_addStyle(`
        .optimism-context-menu {
            position: absolute;
            background-color: #fff;
            border: 1px solid #ccc;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            list-style: none;
            padding: 5px 0;
            margin: 0;
            display: none;
            z-index: 1000;
        }

        .optimism-context-menu li {
            padding: 8px 16px;
            cursor: pointer;
        }

        .optimism-context-menu li:hover {
            background-color: #f0f0f0;
        }
        `);
    },
};
const menu0 = {
    openPrompt() {

    },
    PromptMenu: class {
        constructor() {
            this.overlay = null;
            this.menu = null;
        }

        open(content, placeholder, onSubmit, onCancel) {
            // Create overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'optimism-prompt-menu-overlay';
            this.overlay.addEventListener('click', () => this.close());

            // Create menu container
            this.menu = document.createElement('div');
            this.menu.className = 'optimism-prompt-menu';

            // Header
            const header = document.createElement('div');
            header.className = 'optimism-prompt-menu-header';
            header.textContent = 'Prompt Menu';

            // Body (HTML Content)
            const body = document.createElement('div');
            body.className = 'optimism-prompt-menu-body';
            body.innerHTML = content;

            // Input section
            const inputSection = document.createElement('div');
            inputSection.className = 'optimism-prompt-menu-input';

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.placeholder = placeholder;
            inputField.addEventListener('keydown', event => {
                if (event.key !== 'Enter' || event.repeat) return;
                onSubmit(inputField.value);
                this.close();
            });
            const buttons = document.createElement('div');
            buttons.className = 'optimism-prompt-menu-buttons';

            const submitButton = document.createElement('button');
            submitButton.className = 'optimism-btn-submit';
            submitButton.textContent = 'Submit';
            submitButton.addEventListener('click', () => {
                onSubmit(inputField.value);
                this.close();
            });

            const cancelButton = document.createElement('button');
            cancelButton.className = 'optimism-btn-cancel';
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                if (onCancel) onCancel();
                this.close();
            });

            buttons.appendChild(submitButton);
            buttons.appendChild(cancelButton);

            inputSection.appendChild(inputField);
            inputSection.appendChild(buttons);

            // Combine all parts
            this.menu.appendChild(header);
            this.menu.appendChild(body);
            this.menu.appendChild(inputSection);

            // Add to document
            document.body.appendChild(this.overlay);
            document.body.appendChild(this.menu);
            inputField.focus();
        }

        close() {
            if (this.overlay) {
                document.body.removeChild(this.overlay);
                this.overlay = null;
            }
            if (this.menu) {
                document.body.removeChild(this.menu);
                this.menu = null;
            }
        }
    },
    injectCSS() {
        GM_addStyle(`
        .optimism-prompt-menu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            width: 400px;
            max-width: 90%;
            z-index: 1000;
            overflow: hidden;
        }
        .optimism-prompt-menu-header {
            padding: 16px;
            font-size: 18px;
            font-weight: bold;
            background-color: #f5f5f5;
            border-bottom: 1px solid #ddd;
        }
        .optimism-prompt-menu-body {
            padding: 16px;
            font-size: 14px;
        }
        .optimism-prompt-menu-input {
            display: flex;
            flex-direction: column;
            padding: 16px;
            border-top: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .optimism-prompt-menu-input input {
            font-size: 14px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .optimism-prompt-menu-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 8px;
        }
        .optimism-prompt-menu-buttons button {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .optimism-prompt-menu-buttons .btn-submit {
            background-color: #007bff;
            color: white;
        }
        .optimism-prompt-menu-buttons .btn-cancel {
            background-color: #ccc;
            color: black;
        }
        .optimism-prompt-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }
        `);
    },
};
const ek5 = {
    async establishEKtabClosingEventListener() {
        const tabsList = claim(type.element, await pollingSelector(document, '.dndList.tabs-list.tabs'));
        GM_addValueChangeListener('closeEKtab', async (key, oldValue, newValue) => {
            await attempt(async () => {
                if (newValue === null) return;
                if (newValue === 'active') {
                    await tools.pause(50);
                    const activeTab = claim(type.element, await pollingSelector(tabsList, '.active'));
                    const closeEKtabButtonI = claim(type.element, await pollingSelector(activeTab, 'i'));
                    //closeEKtabButtonI.dispatchEvent(new Event('click', {bubbles:true}));
                    closeEKtabButtonI.click();
                    GM_setValue('closeEKtab', null);
                }
            }, tools.defaultCatchCallback.bind(tools, 'ЭК5 (закрытие вкладок)'));
        });
    },
};
const eok = {
    async establishCollapsedAreasAutoOpening() {
        const body = await pollingSelector(document, 'body');
        addSafeObserver(body, {
            attributes: true,
            attributeOldValue: true
        }, 'ЕОК (открытие областей оплаты и истории мест)', async records => {
            if (records[0].oldValue !== 'overflowHidden') return;
            const collapsePaymentBtn = claim(type.element, await pollingSelector(document, '#CollapsePaymentBtn'));
            const collapsePlacesBtn = claim(type.element, await pollingSelector(document, '#CollapsePlacesBtn'));
            const appCards = claim(type.nodeList, document.querySelectorAll('app-card')); // no need pollingSelector, appCards are parents of buttons
            affirm(appCards.length === 2, 'Обнаружено более или менее двух app-card.');
            const paymentIntervalId = setSafeInterval('ЕОК (открытие областей оплаты и истории мест)', () => {
                if (appCards[0].className.includes('collapsed')) {
                    collapsePaymentBtn.dispatchEvent(new Event('click'));
                    return;
                }
                clearInterval(paymentIntervalId);
            }, 500);
            const placesIntervalId = setSafeInterval('ЕОК (открытие областей оплаты и истории мест)', () => {
                if (appCards[1].className.includes('collapsed')) {
                    collapsePlacesBtn.dispatchEvent(new Event('click'));
                    return;
                }
                clearInterval(placesIntervalId);
            }, 500);
        });
    },
    async markMultiplePlaces2() {
        const body = await pollingSelector(document, 'body');
        addSafeObserver(body, {
            attributes: true,
            attributeOldValue: true
        }, 'ЕОК (окрашивание многоместных селектов)', async records => {
            if (records[0].oldValue !== 'overflowHidden') return;
            const placeSelect = claim(type.element, await pollingSelector(document, '#PlaceSelect'));
            const divControl = claim(type.element, await pollingSelector(placeSelect, 'div.control'));
            const dropdownItems = claim(type.nodeList, await pollingSelectorAll(placeSelect, 'cdek-dropdown-item', 1));
            if (dropdownItems.length < 2) {
                divControl.style.backgroundColor = 'white';
                return;
            }
            divControl.style.backgroundColor = cfg.color.orange;
        });
    },
    async establishNotificationBlockMessagerequestTabAutoOpening() {
        const body = await pollingSelector(document, 'body');
        addSafeObserver(body, {
            attributes: true,
            attributeOldValue: true
        }, 'ЕОК (открытие вкладки сообщений заросов)', async records => {
            if (records[0].oldValue !== 'overflowHidden') return;
            const notificationBlockTab = claim(type.element, await pollingSelector(document, '#notificationBlockTab'));
            const notificationBlockTabLi = claim(type.nodeList, await pollingSelectorAll(notificationBlockTab, 'li', 4));
            let messagerequestTabLi;
            for (let li of notificationBlockTabLi) {
                if (li.innerText.includes('Сообщения-запросы')) {
                    messagerequestTabLi = li;
                }
            }
            affirm(type.element(messagerequestTabLi), 'Не найдена вкладка Сообщения-запросы');
            messagerequestTabLi.dispatchEvent(new Event('click'), {
                bubbles: true
            });
        });
    },
    async establishContextMenuOnLinks() {
        const body = await pollingSelector(document, 'body');
        addSafeObserver(body, {
            attributes: true,
            attributeOldValue: true
        }, 'ЕОК (кастомное контекстное меню)', async records => {
            if (records[0].oldValue !== 'overflowHidden') return;
            await until(() => type.element(document.querySelector('.order-link')));
            const cm = new ctxmenu.ContextMenu('.order-link', [{
                label: 'Копировать',
                action() {
                    GM_setClipboard(this.ctxmenuEvent.target.innerText, 'text')
                }
            }]);
            const cm2 = new ctxmenu.ContextMenu('.link', [{
                label: 'Копировать',
                action() {
                    GM_setClipboard(this.ctxmenuEvent.target.innerText, 'text')
                }
            }]);
            const cm3 = new ctxmenu.ContextMenu('#GoToContractBtn', [{
                label: 'Копировать',
                action() {
                    GM_setClipboard(this.ctxmenuEvent.target.innerText, 'text')
                }
            }]);
        });
    },
    saveOrderClientsResponseData(xhrInstance) {
        affirm(xhrInstance.status === 200, 'Сервер не ответил: подробности о клиентах');
        const response = JSON.parse(xhrInstance.responseText);
        const orderID = claim(type.orderIDstring, xhrInstance.responseURL.split('/').pop());
        // let isOrderClientsExtraDataSizeLimitReached = false;
        storage.editObject('smartAdviceWindow', smartAdviceWindow => {
            if (smartAdviceWindow.orderClientsExtraData.length > 16) {
                tools.showError(
                    'Предупреждение: повышенное использование хранилища скрипта ' +
                    '(smartAdviceWindow.orderClientsExtraData). ' +
                    'Просьба передать Антону.'
                );
            }
            const notExpiredData = smartAdviceWindow.orderClientsExtraData.filter(item => {
                if (context.userscriptInjectionTimestamp - item.timestamp < 60000) return true; // более минуты
            });
            smartAdviceWindow.orderClientsExtraData = notExpiredData;
            smartAdviceWindow.orderClientsExtraData.push({
                orderID,
                timestamp: Date.now(),
                sender: {
                    country: claim(type.string, response?.sender?.country?.name),
                    region: claim(type.string, response?.sender?.region?.name),
                    city: claim(type.string, response?.sender?.city?.name),
                    timeZone: claim(type.string, response?.sender?.timeZone),
                    contragentType: claim(type.string, response?.sender?.contragentType),
                },
                receiver: {
                    country: claim(type.string, response?.receiver?.country?.name),
                    region: claim(type.string, response?.receiver?.region?.name),
                    city: claim(type.string, response?.receiver?.city?.name),
                    timeZone: claim(type.string, response?.receiver?.timeZone),
                    contragentType: claim(type.string, response?.receiver?.contragentType),
                },
            });
        });
    },
    async establishOrderClientsExtraDataTooltips() {
        const body = await pollingSelector(document, 'body');
        addSafeObserver(body, {
            attributes: true,
            attributeOldValue: true
        }, 'ЕОК (открытие областей оплаты и истории мест)', async records => {
            if (records[0].oldValue !== 'overflowHidden') return;
            
            /* определение номера заказа */

            const orderIDinput = claim(type.element, await pollingSelector(
                document, 'cdek-input[formcontrolname=orderNumber] input'
            ));
            const orderID = claim(type.orderIDstring, orderIDinput.value);

            /* проверяем, а есть ли подходящий orderClientsExtraData */

            let suitableData;
            storage.editObject('smartAdviceWindow', smartAdviceWindow => {
                const notExpiredData = smartAdviceWindow.orderClientsExtraData.filter(item => {
                    if (context.userscriptInjectionTimestamp - item.timestamp < 60000) return true; // более минуты
                });
                suitableData = notExpiredData.filter(item => {
                    if (item.orderID === orderID) return true;
                });
                smartAdviceWindow.orderClientsExtraData = notExpiredData;
            });
            if (suitableData.length === 0) {
                tools.showError('Актуальные подробности о клиентах для этого заказа не найдены (физ/юр и др.).');
                return;
            }
            suitableData.sort((a,b) => b.timestamp - a.timestamp); // первый будет самым поздно записанным

            /* добавляем title-атрибуты */

            const cards = claim(type.nodeList, await pollingSelectorAll(
                document, 'div.cards div.card', 2
            ));
            affirm(cards[0].innerText.includes('Отправитель'), 'Не найден блок "Отправитель"');
            affirm(cards[1].innerText.includes('Получатель'), 'Не найден блок "Получатель"');
            const clientsStrings = [['sender','об отправителе','Отправитель'], ['receiver','о получателе','Получатель']];
            const contragentTypeStrings = { FIZ: 'Физ. лицо', UR: 'Юр. лицо' };
            for (let iter = 0; iter < 2; iter++) {
                const client = suitableData[0][ clientsStrings[iter][0] ];
                const staticPart = ' ----- ' + contragentTypeStrings[client.contragentType] + ' ----- ' + 
                client.city + ', ' + client.region + ', ' + client.country;
                addSafeListener(cards[iter], 'dblclick', 'Двойной клик по блоку клиента в ЕОК', () => {
                    const time = (new Date).toLocaleTimeString('ru', {
                        timeZone: client.timeZone
                    })
                    tools.showMessage(
                        clientsStrings[iter][2] + ' ----- ' +
                        time + staticPart, cfg.color.bluegray
                    );
                });
            }
            // const clients = ['sender', 'receiver'];
            // for (let iter = 0; iter < 2; iter++) {
            //     const spans = claim(type.nodeList, await pollingSelectorAll(
            //         cards[iter], 'span.name', 5
            //     ));
            //     for (let span of spans) {

            //     }
            // }
        });
    },
};
const preorder = {
    async resetRequestFilter() {
        const resetButton = claim(type.element, await pollingSelector(document, '#clearButtonRequest'));
        const findButton = claim(type.element, await pollingSelector(document, '#findButtonRequest'));
        var intervalId = setInterval(() => {
            if (findButton.disabled) {
                clearInterval(intervalId);
            };
            resetButton.dispatchEvent(new Event('click', {
                bubbles: true
            }));
        }, 1000);
    },
    async setFilterValue(id) {
        const requestFilterInput = claim(type.element, await pollingSelector(document, '#requestFilterInput'));
        // const findButton = claim(type.element, await pollingSelector(document, '#findButtonRequest') );
        requestFilterInput.setAttribute('value', id);
        requestFilterInput.dispatchEvent(new Event('change', {
            bubbles: true
        }));
        // requestFilterInput.dispatchEvent(new Event('keydown', {key: 'Enter'}));
        //findButton.dispatchEvent(new Event('click'));
    },
};
const messagerequest = {
    /* Create form */
    async establishDefaultBranchChoosing() {
        addSafeListener(document.body, 'dblclick', 'Форма создания СЗ (автовыбор ветви)', async event => {
            const way = usercfg?.data?.settings?.messagerequestDefaultBranchChoosing?.menuOpeningWay || 2; // если способ не выбирался, то по умолчанию 2 - alt+dblclick
            const extraKeyWay = way !== 1;
            if (extraKeyWay && (!event.altKey && !event.ctrlKey)) return; // если доп.клавиша нужна, но ни ctrl, ни alt не нажаты > выход
            if (way === 2 && !event.altKey) return; // нажат ctrl, а надо alt > выход
            else if (way === 3 && !event.ctrlKey) return; // нажат alt, а надо ctrl > выход
            const choice = menu.prompt([
                'НСК > CК > Претензии от операторов', 'НСК > CК > Заявки на изменения накладной',
                'НСК > CК > Запрос документов', 'НСК > CК > Сопровождение Китайских франчайзи', 'НСК > CК > Отключение уведомлений'
            ]);
            if (choice === 0) return;
            else if (choice === 1) {
                await messagerequest.chooseDefaultBranch(false, 'ретензии');
            } else if (choice === 2) {
                await messagerequest.chooseDefaultBranch(false, 'изменен');
            } else if (choice === 3) {
                await messagerequest.chooseDefaultBranch(false, 'документ');
            } else if (choice === 4) {
                await messagerequest.chooseDefaultBranch(false, 'итайски');
            } else if (choice === 5) {
                await messagerequest.chooseDefaultBranch(false, 'ведомлени');
            }
        });
    },
    async chooseDefaultBranch(nogroup, groupName) {
        const body = claim(type.element, await pollingSelector(document, 'body'));
        body.style.display = 'none';
        await messagerequest._clickDropdownItem('вручную');
        await messagerequest._chooseNovosibirsk();
        await messagerequest._chooseOfficeAndWaitGroupLoading(nogroup, groupName);
        body.style.display = '';
        if (nogroup) return;
        await messagerequest._clickDropdownItem(groupName);
    },
    async _chooseNovosibirsk() {
        const NSKdiv = claim(type.element, await pollingSelector(document, '#cityItemBtn_2'));
        affirm(NSKdiv.innerText.includes('НСК'), 'Не найдена кнопка НСК');
        NSKdiv.dispatchEvent(new Event('click'));
    },
    async _chooseOfficeAndWaitGroupLoading(nogroup, groupName) {
        const officeCtrl0 = claim(type.element, await pollingSelector(document, '#officeCtrl_0'));
        const input = claim(type.element, await pollingSelector(officeCtrl0, 'input'));
        input.value = 'сервис';
        input.dispatchEvent(new Event('input', {
            bubbles: true
        }));
        input.dispatchEvent(new Event('click', {
            bubbles: true
        }));
        const dropdowns = claim(type.nodeList, await pollingSelectorAll(document, 'cdek-dropdown', 4));
        await until(() => dropdowns[0].parentElement.innerText.includes('ервисна'));
        let officeDropdown;
        for (let dropdown of dropdowns) {
            if (dropdown.innerText.includes('ервисна')) {
                officeDropdown = dropdown;
            }
        }
        affirm(type.element(officeDropdown), 'Не найден officeDropdown');
        affirm(officeDropdown.children.length === 1, 'Не типичное количество потомков officeDropdown');
        officeDropdown.children[0].dispatchEvent(new Event('click'));
        const groupCtrl0 = claim(type.element, await pollingSelector(document, '#groupCtrl_0'));
        const cdekCommonContolGroup = claim(type.element, await pollingSelector(groupCtrl0, 'cdek-common-control'));
        await until(() => {
            cdekCommonContolGroup.dispatchEvent(new Event('click'));
            return dropdowns[0].parentElement.innerText.includes(groupName)
        });
    },
    async _clickDropdownItem(name) {
        const cdekDropdownList = claim(type.nodeList, await pollingSelectorAll(document, 'cdek-dropdown', 2));
        let dropdown;
        for (let node of cdekDropdownList) {
            if (node.innerHTML.includes(name)) {
                dropdown = node;
                break;
            }
        }
        affirm(type.element(dropdown), 'Не удалось определить dropdown для ' + name);
        for (let item of dropdown.children) {
            if (item.innerHTML.includes(name)) {
                item.dispatchEvent(new Event('click'), {
                    bubbles: true
                });
                break;
            }
        }
    },
    async establishCreateFormCompleteButtonsTabAutoClosing() {
        const closeFormBtn = claim(type.element, await pollingSelector(document, '#closeFormBtn'));
        const sendFormBtn = claim(type.element, await pollingSelector(document, '#sendFormBtn'));
        addSafeListener(sendFormBtn, 'click', 'Форма создания СЗ (закрытие активной вкладки кнопками Отправить/Закрыть)', () => {
            tools.dispatchEKtabClosingEvent();
        });
        addSafeListener(closeFormBtn, 'click', 'Форма создания СЗ (закрытие активной вкладки кнопками Отправить/Закрыть)', () => {
            tools.dispatchEKtabClosingEvent();
        });
    },
};
const companystructure = {
    async establishEnterKeyExtraListener() {
        const body = await pollingSelector(document, 'body');
        const cdekButtons = claim(type.nodeList, await pollingSelectorAll(body, 'cdek-button', 10));
        let findButton, cleanButton;
        for (let btn of cdekButtons) {
            if (btn.innerText.includes('НАЙТИ')) findButton = btn;
            if (btn.innerText.includes('ОЧИСТИТЬ')) cleanButton = btn;
        };
        affirm(type.element(findButton), 'Кнопка "Найти" не обнаружена.');
        affirm(type.element(cleanButton), 'Кнопка "Очистить" не обнаружена.');

        const appOfficeFilter = claim(type.element, await pollingSelector(document, 'app-office-filter'));
        affirm(type.element(appOfficeFilter.firstElementChild), 'Не обнаружен appOfficeFilter.firstElementChild');
        affirm(type.htmlCollection(appOfficeFilter.firstElementChild.children), 'Не обнаружен appOfficeFilter.firstElementChild.children');
        let officeCodeDiv;
        for (let element of appOfficeFilter.firstElementChild.children) {
            if (element.innerText.includes('Код офиса')) {
                officeCodeDiv = element;
                break;
            }
        }
        affirm(type.element(officeCodeDiv), 'Не обнаружен officeCodeDiv');
        const agCenterColsClipper = claim(type.element, await pollingSelector(document, '.ag-center-cols-clipper'));
        addSafeListener(officeCodeDiv, 'keydown', 'Офисы (Enter в поле кода офиса нажимает Найти и очищает фильтр)', async event => {
            const officeCode = event.target.value.toUpperCase();
            if (event.key !== 'Enter' || event.repeat) return;
            const divSibling = claim(type.element, event.target.nextElementSibling);
            const totalCountSpan = claim(type.element, await pollingSelector(divSibling, '.total-count'));
            await until(() => totalCountSpan.innerText !== '0');
            findButton.dispatchEvent(new Event('click'));
            await until(() => agCenterColsClipper.innerText.includes(officeCode));
            cleanButton.dispatchEvent(new Event('click'));
        });
    },
};
const coworker = {
    async establishEnterKeyExtraListener() {
        const body = await pollingSelector(document, 'body');
        const cdekButtons = claim(type.nodeList, await pollingSelectorAll(body, 'cdek-button', 8));
        let findButton, cleanButton;
        for (let btn of cdekButtons) {
            if (btn.innerText.includes('НАЙТИ')) findButton = btn;
            if (btn.innerText.includes('ОЧИСТИТЬ')) cleanButton = btn;
        };
        affirm(type.element(findButton), 'Кнопка "Найти" не обнаружена.');
        affirm(type.element(cleanButton), 'Кнопка "Очистить" не обнаружена.');

        const cdekMultiautocompleteOffice = claim(type.element, await pollingSelector(document, 'cdek-multiautocomplete[formcontrolname=office]'));
        addSafeListener(cdekMultiautocompleteOffice, 'keydown', 'Сотрудник (Enter в поле кода офиса выбирает 1-ый офис, нажимает Найти и очищает фильтр)', async event => {
            if (event.key !== 'Enter' || event.repeat) return;
            event.preventDefault();
            const firstOption = claim(type.element, cdekMultiautocompleteOffice.querySelector('div.option'));
            firstOption.click();
            await tools.pause(1000);
            findButton.dispatchEvent(new Event('click'));
            await tools.pause(2000);
            cleanButton.dispatchEvent(new Event('click'));
        });
    },
};
const calltask = {
    async establishSaveButtonTabAutoClosing() {
        const outcomeButton = claim(type.element, await pollingSelector(document, '#outcomeButton'));
        addSafeListener(outcomeButton, 'click', 'ДЗНП (автоматическое закрытие раздела после нажатия Сохранить)', async () => {
            const saveCallBtn = claim(type.element, await pollingSelector(document, '#saveCall'));
            addSafeListener(saveCallBtn, 'click', 'ДЗНП (автоматическое закрытие раздела после нажатия Сохранить)', async () => {
                const closeModalBtn = claim(type.element, await pollingSelector(document, '#closeModalBtn'));
                addSafeListener(closeModalBtn, 'click', 'ДЗНП (автоматическое закрытие раздела после нажатия Сохранить)', async () => {
                    await tools.pause(50);
                    tools.dispatchEKtabClosingEvent();
                });
            });
        });
    },
};
const orderec5 = {
    async establishLathingExtraDeliveryDayNotification() {
        const placesDiv = claim(type.element, await pollingSelector(document, '#places'));
        const observer = addSafeObserver(placesDiv, {
            childList: true, subtree: true,
        }, 'Создание/редактирование заказа (предупреждение: обрешетка увеличивает срок доставки на 1 день)', async (records, observer) => {
            if (placesDiv.innerText.includes('ВГХ с обрешёткой')) {
                observer.disconnect();
                tools.showMessage('Изготовление обрешётки увеличивает срок доставки на 1 рабочий день.');
            }
        });
    },
    async establishTransportSchemeMemorization() {
        const pattern = 'Авиа в ТС: ';
        const tariffsDiv = claim(type.element, await pollingSelector(document, '#tariffs'));
        const observer = addSafeObserver(tariffsDiv, {
            childList: true, subtree: true,
        }, 'Создание/редактирование заказа (признаки ТС (земля/авиа) запоминаются в подсказки)', async (records, observer) => {
            if ( !type.tableSectionElement(records[0].addedNodes[0]) ) return;
            const rows = claim(type.nodeList, await pollingSelectorAll(tariffsDiv, 'tr.ng-star-inserted', 1));
            for (let row of rows) {
                const i = claim(type.element, await pollingSelector(row, 'i'));
                const tsCell = i.parentElement;
                if (i.className.includes('flight')) tsCell.title = pattern + 'да+';
                else if (i.className.includes('car')) tsCell.title = pattern + 'нет-';
            }
        });
    },
    async establishSumDifferenceCalculation() {
        const appSummary = claim(type.element, await pollingSelector(document, 'app-summary'));
        addSafeObserver(appSummary, {
            childList: true, subtree: true,
        }, 'Создание/редактирование заказа (разность сумм при внесении изменений)', async () => {
            const appTotalCostResult = claim(type.element, await pollingSelector(document, 'app-total-cost-result'));
            const spanPrevious = appTotalCostResult.querySelector('span.previous');
            if (!type.element(spanPrevious)) return;
            const spanHeadline = claim(type.element, await pollingSelector(appTotalCostResult, 'span.headline-value'));
            const previousNumber = tools.getNumberOfCost(spanPrevious.innerText);
            const headlineNumber = tools.getNumberOfCost(spanHeadline.innerText);
            let difference = (headlineNumber - previousNumber).toFixed(2) + "";
            if (difference[0] !== '-') difference = '+' + difference;
            spanPrevious.title = headlineNumber + ' - ' + previousNumber + ' = ' + difference;
        });
    },
    async establishLAUOnotification() { // LAUO - Loading and unloading operations (ПРР)

    },
};
const gateway = {
    async request(method, url, body, referrer, token) {
        const response = await fetch(url, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "pwt": token,
                //"sec-ch-ua": "\"Microsoft Edge\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-auth-token": token,
                "x-user-lang": "rus"
            },
            "referrer": referrer,
            // "referrerPolicy": "strict-origin-when-cross-origin",
            "body": body,
            "method": method,
            "mode": "cors",
            "credentials": "omit"
        });
        affirm(response.status === 200, 'Неудачный запрос: ' + url);
        return response;
    },

};
attempt(main.run.bind(main), tools.defaultCatchCallback.bind(tools, location.host));
