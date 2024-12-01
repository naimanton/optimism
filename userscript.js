// ==UserScript==
// @name         optimism: cdek/contact-centre
// @namespace    http://tampermonkey.net/
// @version      2024-11-24
// @description  workflow optimisation for ek5 and contact-centre
// @author       Ton
// @match        https://ek5.cdek.ru/*
// match        https://svvs.contact-centre.ru/*
// @match        https://preorderec5.cdek.ru/*
// @match        https://singleadvicewindowng.cdek.ru/*
// @match        https://messagerequestscreateformng.cdek.ru/*
// @match        https://companystructurefrontng.cdek.ru/*
// @match        https://coworker.cdek.ru/*
// require      https://unpkg.com/@popperjs/core@2
// require      https://unpkg.com/tippy.js@6
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_notification
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).ContextMenu=t()}(this,function(){"use strict";var e,t,n,i;e=".ContextMenu{display:none;list-style:none;margin:0;max-width:250px;min-width:125px;padding:0;position:absolute;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ContextMenu--theme-default{background-color:#fff;border:1px solid rgba(0,0,0,.2);-webkit-box-shadow:0 2px 5px rgba(0,0,0,.15);box-shadow:0 2px 5px rgba(0,0,0,.15);font-size:13px;outline:0;padding:2px 0}.ContextMenu--theme-default .ContextMenu-item{padding:6px 12px}.ContextMenu--theme-default .ContextMenu-item:focus,.ContextMenu--theme-default .ContextMenu-item:hover{background-color:rgba(0,0,0,.05)}.ContextMenu--theme-default .ContextMenu-item:focus{outline:0}.ContextMenu--theme-default .ContextMenu-divider{background-color:rgba(0,0,0,.15)}.ContextMenu.is-open{display:block}.ContextMenu-item{cursor:pointer;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ContextMenu-divider{height:1px;margin:4px 0}",i=(t=void 0===t?{}:t).insertAt,e&&"undefined"!=typeof document&&(n=document.head||document.getElementsByTagName("head")[0],(t=document.createElement("style")).type="text/css","top"===i&&n.firstChild?n.insertBefore(t,n.firstChild):n.appendChild(t),t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)));var o=[],s=0;function u(e,t,n){void 0===n&&(n={});var i=document.createEvent("Event");Object.keys(n).forEach(function(e){i[e]=n[e]}),i.initEvent(t,!0,!0),e.dispatchEvent(i)}Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector);function a(e,t,n){void 0===n&&(n={className:"",minimalStyling:!1}),this.selector=e,this.items=t,this.options=n,this.id=s++,this.target=null,this.create(),o.push(this)}return a.prototype.create=function(){var i=this;this.menu=document.createElement("ul"),this.menu.className="ContextMenu",this.menu.setAttribute("data-contextmenu",this.id),this.menu.setAttribute("tabindex",-1),this.menu.addEventListener("keyup",function(e){switch(e.which){case 38:i.moveFocus(-1);break;case 40:i.moveFocus(1);break;case 27:i.hide()}}),this.options.minimalStyling||this.menu.classList.add("ContextMenu--theme-default"),this.options.className&&this.options.className.split(" ").forEach(function(e){return i.menu.classList.add(e)}),this.items.forEach(function(e,t){var n=document.createElement("li");"name"in e?(n.className="ContextMenu-item",n.textContent=e.name,n.setAttribute("data-contextmenuitem",t),n.setAttribute("tabindex",0),n.addEventListener("click",i.select.bind(i,n)),n.addEventListener("keyup",function(e){13===e.which&&i.select(n)})):n.className="ContextMenu-divider",i.menu.appendChild(n)}),document.body.appendChild(this.menu),u(this.menu,"created")},a.prototype.show=function(e){this.menu.style.left=e.pageX+"px",this.menu.style.top=e.pageY+"px",this.menu.classList.add("is-open"),this.target=e.target,this.menu.focus(),e.preventDefault(),u(this.menu,"shown")},a.prototype.hide=function(){this.menu.classList.remove("is-open"),this.target=null,u(this.menu,"hidden")},a.prototype.select=function(e){e=e.getAttribute("data-contextmenuitem");this.items[e]&&this.items[e].fn(this.target),this.hide(),u(this.menu,"itemselected")},a.prototype.moveFocus=function(e){void 0===e&&(e=1);var t,n=this.menu.querySelector("[data-contextmenuitem]:focus");(t=(t=n?function e(t,n,i){t=0<(i=void 0===i?1:i)?t.nextElementSibling:t.previousElementSibling;return!t||t.matches(n)?t:e(t,n,i)}(n,"[data-contextmenuitem]",e):t)||(0<e?this.menu.querySelector("[data-contextmenuitem]:first-child"):this.menu.querySelector("[data-contextmenuitem]:last-child")))&&t.focus()},a.prototype.on=function(e,t){this.menu.addEventListener(e,t)},a.prototype.off=function(e,t){this.menu.removeEventListener(e,t)},a.prototype.destroy=function(){this.menu.parentElement.removeChild(this.menu),this.menu=null,o.splice(o.indexOf(this),1)},document.addEventListener("contextmenu",function(t){o.forEach(function(e){t.target.matches(e.selector)&&e.show(t)})}),document.addEventListener("click",function(t){o.forEach(function(e){t.target.matches('[data-contextmenu="'+e.id+'"], [data-contextmenu="'+e.id+'"] *')||e.hide()})}),a});

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
    'svvs.contact-centre.ru', 'ek5.cdek.ru', 'preorderec5.cdek.ru', 'singleadvicewindowng.cdek.ru',
    'messagerequestscreateformng.cdek.ru', 'companystructurefrontng.cdek.ru', 'coworker.cdek.ru'
  ],
  color: {
    softYellow: '#fff8e1',
    softOrange: '#ffe2b7',
    orange: '#ffa000',
    bluegreen: '#069697',
  },
};
const l = console.log;
const qw = l;
const affirm = function (boolean, message) {
  if (boolean) return;
  throw new Error(message);
};
const claim = function (assertionMethod, item) {
  affirm(assertionMethod(item), 'Type error in claim()');
  return item;
};
const attempt = async function (tryCallback, catchCallback) {
  try { await tryCallback(); }
  catch (error) { await catchCallback(error); }
};
const addSafeListener = function (element, eventType, title, callback) {
  return element.addEventListener(
    eventType, event => {
      attempt(() => callback(event), tools.defaultCatchCallback.bind(tools, title));
    }
  );
};
const addSafeObserver = function (element, options, title, callback) {
  const mo = new MutationObserver( (records, mo) => {
    attempt(() => callback(records, mo), tools.defaultCatchCallback.bind(tools, title));
  });
  mo.observe(element, options);
  return mo;
};
const setSafeInterval = function (title, callback, intervalMs) {
  return setInterval(attempt.bind(null, callback, tools.defaultCatchCallback.bind(tools, title)), intervalMs);
};
const until = function (method, intervalMs=1000) {
  return new Promise(function (resolve, reject) {
    if (method()) {
        resolve();
        return;
    }
    let counter = 0;
    const intervalId = setInterval(function () {
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
};
const pollingSelector = function (element, selector, intervalMs=1000) {
  return new Promise(function (resolve, reject) {
    const resultElement = element.querySelector(selector);
    if (resultElement !== null) {
        resolve(resultElement);
        return;
    }
    let counter = 0;
    const intervalId = setInterval(function () {
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
};
const pollingSelectorAll = function (element, selector, len=1, intervalMs=1000) {
  return new Promise(function (resolve, reject) {
    const resultCollection = element.querySelectorAll(selector);
    if (resultCollection.length >= len) {
        resolve(resultCollection);
        return;
    }
    let counter = 0;
    const intervalId = setInterval(function () {
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
};
const type = {
  of: item => Object.prototype.toString.call(item).toLowerCase(),
  element: item => item instanceof Element,
  nodeList: item => type.of(item) === '[object nodelist]',
  htmlCollection: item => type.of(item) === '[object htmlcollection]',
  object: item => type.of(item) === '[object object]',
  notEmptyString: item => type.of(item) === '[object string]' && item.length > 0,
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
    return claim(type.notEmptyString, localStorage.getItem('pwt'));
  },
  showError(message) { // не моя, надо стабилизировать
    const errorContainer = document.getElementById('optimismErrorContainer');
    const errorPopup = document.createElement('div');
    errorPopup.className = 'optimism-error-popup';
    errorPopup.textContent = `❌ ${message}`;
    // Добавляем класс для отображения
    setTimeout(() => {
      errorPopup.classList.add('show');
    }, 10);
    // Удаляем уведомление через 3 секунды
    //setTimeout(() => {
      //errorPopup.classList.remove('show');
      //setTimeout(() => errorPopup.remove(), 300); // Убираем из DOM после анимации
    //}, 5000);
    // Добавляем уведомление в контейнер
    errorContainer.appendChild(errorPopup);
  },
};
const main = {
  async run() {
    const domain = main.getDomainFromWhiteList(location.href);
    if (domain === false) return;
    main.injectErrorCSS();
    await main.injectErrorDiv();
    usercfg.loadFromStorage();
    await main.manageScripts(domain);
  },
  async injectErrorDiv() {
    const body = claim(type.element, await pollingSelector(document, 'body'));
    body.insertAdjacentHTML('beforeend', '<div id="optimismErrorContainer" class="optimism-error-container"></div>')
    const optimismErrorContainer = document.querySelector('#optimismErrorContainer');
    addSafeListener(optimismErrorContainer, 'click', 'Контейнер ошибок (удаление ошибок кликом)', () => {
      //for (let popup of optimismErrorContainer.children) {
        //popup.classList.remove('show');
      //}
      optimismErrorContainer.innerHTML = '';
    });
  },
  injectErrorCSS() {
    GM_addStyle(`
        .optimism-error-container {
            position: fixed;
            bottom: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        }
        .optimism-error-popup {
            background-color: #ffe2b7;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            font-size: 16px;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .optimism-error-popup.show {
            opacity: 1;
            transform: translateX(0);
        }
    `);
  },
  async manageScripts(domain) {
    if (domain === 'svvs.contact-centre.ru') {
      // svvs.establishAutoupdate();
    }
    else if (domain === 'ek5.cdek.ru') {
      GM_setValue('closeEKtab', null);
      await menu.establish();
      await tools.runScriptIfActiveInUsercfg('ЭК5 (закрытие вкладок)', 'EKtabClosingEventListener', ek5.establishEKtabClosingEventListener.bind(ek5));
    }
    else if (domain === 'singleadvicewindowng.cdek.ru') {
      await tools.runScriptIfActiveInUsercfg('ЕОК (открытие областей оплаты и истории мест)', 'collapsedAreasAutoOpening', eok.establishCollapsedAreasAutoOpening.bind(eok));
      await tools.runScriptIfActiveInUsercfg('ЕОК (окрашивание многоместных селектов)', 'multiplePlacesMarking', eok.markMultiplePlaces2.bind(eok));
      await tools.runScriptIfActiveInUsercfg('ЕОК (открытие вкладки сообщений-запросов)', 'notificationBlockMessagerequestTabAutoOpening', eok.establishNotificationBlockMessagerequestTabAutoOpening.bind(eok));
      await tools.runScriptIfActiveInUsercfg('ЕОК (кастомное контекстное меню)', 'eokContextMenuOnLinks', eok.establishContextMenuOnLinks.bind(eok));
    }
    else if (domain === 'preorderec5.cdek.ru' && !location.href.includes('gate.html')) {
      if (location.href.includes('journal')) {
        await tools.runScriptIfActiveInUsercfg('Журнал заявок (очистка фильтра)', 'requestFilterReset', preorder.resetRequestFilter.bind(preorder));
        //const splittedHref = location.href.split('/');
        //const item = splittedHref.pop(); // id or string
        //if (!isFinite(item)) return;
        //await tools.runScriptIfActiveInUsercfg('requestFilterValueSet', preorder.setFilterValue.bind(preorder, item));
      }
      else {

      }
    }
    else if (domain === 'messagerequestscreateformng.cdek.ru') {
      await tools.runScriptIfActiveInUsercfg('Форма создания СЗ (автовыбор ветви)', 'messagerequestDefaultBranchChoosing', messagerequest.establishDefaultBranchChoosing.bind(messagerequest));
      await tools.runScriptIfActiveInUsercfg('Форма создания СЗ (закрытие активной вкладки кнопками Отправить/Закрыть)', 'messagerequestCreateFormCompleteButtonsTabAutoClosing', messagerequest.establishCreateFormCompleteButtonsTabAutoClosing.bind(messagerequest));
    }
    else if (domain === 'companystructurefrontng.cdek.ru') {
      await tools.runScriptIfActiveInUsercfg('Офисы (Enter в поле кода офиса нажимает Найти и очищает фильтр)', 'companystructureEnterKeyExtraListener', companystructure.establishEnterKeyExtraListener.bind(companystructure));
    }
    else if (domain === 'coworker.cdek.ru') {
      await tools.runScriptIfActiveInUsercfg('Сотрудник (Enter в поле кода офиса выбирает 1-ый офис, нажимает Найти и очищает фильтр)', 'coworkerEnterKeyExtraListener', coworker.establishEnterKeyExtraListener.bind(companystructure));
    }
  },
  getDomainFromWhiteList(url) {
    for (let domain of cfg.domainWhiteList) {
      if (url.includes(domain)) return domain;
    }
    return false;
  },
};
const menu = {
  establish() {
    addSafeListener(document, 'keydown', 'ЭК5 (меню юзерскрипта)', event => {
      if (!event.altKey || event.key !== 'End' || event.repeat) return;
      const mainChoice = menu.prompt(['Активация/деактивация скриптов']);
      if (mainChoice === null) return
      if (mainChoice === 1) {
        menu.scriptToggling();
        return;
      }
    });
  },
  scriptToggling() {
    const scriptChoice = menu.prompt([
      menu.get_isActive_prefix('EKtabClosingEventListener') + 'ЭК5: Закрывать вкладки, если они просят закрытия',
      menu.get_isActive_prefix('collapsedAreasAutoOpening') + 'ЕОК: Автоматическое открытие областей об оплате и грузоместах',
      menu.get_isActive_prefix('multiplePlacesMarking') + 'ЕОК: Окрашивание селекта мест, если в заказе более 1 места',
      menu.get_isActive_prefix('notificationBlockMessagerequestTabAutoOpening') + 'ЕОК: Автоматическое открытие вкладки сообщений-запросов',
      menu.get_isActive_prefix('eokContextMenuOnLinks') + 'ЕОК: Контекстное меню для копирования текста ссылочных элементов',
      menu.get_isActive_prefix('requestFilterReset') + 'Журнал заявок: Автоматический сброс фильтров',
      menu.get_isActive_prefix('requestFilterValueSet') + 'Журнал заявок: Инъекция идентификатора заявки в поле фильтра',
      menu.get_isActive_prefix('messagerequestDefaultBranchChoosing') + 'Форма создания СЗ: Alt + Двойной клик открывает меню выбора ветви',
      menu.get_isActive_prefix('messagerequestCreateFormCompleteButtonsTabAutoClosing') + 'Форма создания СЗ: Отправка/закрытие формы закрывает вкладку Сообщения-запросы',
      menu.get_isActive_prefix('companystructureEnterKeyExtraListener') + 'Офисы: Enter в фильтре по коду офиса производит поиск и очищает фильтр',
      menu.get_isActive_prefix('coworkerEnterKeyExtraListener') + 'Сотрудник: Enter в фильтре по коду офиса выбирает 1-ый офис, производит поиск и очищает фильтр',
    ]);
    if (scriptChoice === 0) return;
    menu.toggleScriptInUsercfg(scriptChoice);
    alert('Для применения изменений обновите страницу.');
  },
  toggleScriptInUsercfg(n) {
    n--;
    const scriptNames = [
      'EKtabClosingEventListener', 'collapsedAreasAutoOpening','multiplePlacesMarking',
      'notificationBlockMessagerequestTabAutoOpening', 'eokContextMenuOnLinks', 'requestFilterReset',
      'requestFilterValueSet', 'messagerequestDefaultBranchChoosing', 'messagerequestCreateFormCompleteButtonsTabAutoClosing',
      'companystructureEnterKeyExtraListener', 'coworkerEnterKeyExtraListener'
    ];
    affirm(scriptNames.length > n, 'scriptNames содержит меньше имен, чем параметр n');
    if (usercfg.data[ scriptNames[n] ] === undefined) {
      usercfg.data[ scriptNames[n] ] = {};
    }
    if (usercfg.data[ scriptNames[n] ].active === false) {
      usercfg.data[ scriptNames[n] ].active = true;
    }
    else {
      usercfg.data[ scriptNames[n] ].active = false;
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
  }
};
const eok = {
  async establishCollapsedAreasAutoOpening() {
    const body = await pollingSelector(document, 'body');
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, 'ЕОК (открытие областей оплаты и истории мест)', async records => {
      if (records[0].oldValue !== 'overflowHidden') return;
      const collapsePaymentBtn = claim(type.element, await pollingSelector(document, '#CollapsePaymentBtn') );
      const collapsePlacesBtn = claim(type.element, await pollingSelector(document, '#CollapsePlacesBtn') );
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
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, 'ЕОК (окрашивание многоместных селектов)', async records => {
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
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, 'ЕОК (открытие вкладки сообщений заросов)', async records => {
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
      messagerequestTabLi.dispatchEvent(new Event('click'), {bubbles:true});
    });
  },
  async establishContextMenuOnLinks() {
    const body = await pollingSelector(document, 'body');
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, 'ЕОК (кастомное контекстное меню)', async records => {
      if (records[0].oldValue !== 'overflowHidden') return;
      await until(() => type.element(document.querySelector('.order-link')));
      const cm = new ContextMenu('.order-link', [
        {
          name: 'Копировать',
          fn(target) {
            GM_setClipboard(target.innerText, 'text')
          }
        }
      ]);
      const cm2 = new ContextMenu('.link', [
        {
          name: 'Копировать',
          fn(target) {
            GM_setClipboard(target.innerText, 'text')
          }
        }
      ]);
    });
  },
};
const preorder = {
  async resetRequestFilter() {
    const resetButton = claim(type.element, await pollingSelector(document, '#clearButtonRequest') );
    const findButton = claim(type.element, await pollingSelector(document, '#findButtonRequest') );
    var intervalId = setInterval(() => {
      if (findButton.disabled) {
        clearInterval(intervalId);
      };
      resetButton.dispatchEvent(new Event('click', {bubbles:true}));
    }, 1000);
  },
  async setFilterValue(id) {
    const requestFilterInput = claim(type.element, await pollingSelector(document, '#requestFilterInput') );
    // const findButton = claim(type.element, await pollingSelector(document, '#findButtonRequest') );
    requestFilterInput.setAttribute('value', id);
    requestFilterInput.dispatchEvent(new Event('change', {bubbles:true}));
    // requestFilterInput.dispatchEvent(new Event('keydown', {key: 'Enter'}));
    //findButton.dispatchEvent(new Event('click'));
  },
};
const messagerequest = {
  /* Create form */
  async establishDefaultBranchChoosing() {
    addSafeListener(document.body, 'dblclick', 'Форма создания СЗ (автовыбор ветви)', async event => {
      if (!event.altKey) return;
      const choice = menu.prompt([
        'НСК > CК > Претензии от операторов', 'НСК > CК > Заявки на изменения накладной', 'НСК > CК > Запрос документов'
      ]);
      if (choice === 0) return;
      else if (choice === 1) {
        await messagerequest.chooseDefaultBranch(false, 'ретензии');
      }
      else if (choice === 2) {
        await messagerequest.chooseDefaultBranch(false, 'изменен');
      }
      else if (choice === 3) {
        await messagerequest.chooseDefaultBranch(false, 'документ');
      }
    });
  },
  async chooseDefaultBranch (nogroup, groupName) {
    const body = claim(type.element, await pollingSelector(document, 'body') );
    body.style.display = 'none';
    await messagerequest._clickDropdownItem('вручную');
    await messagerequest._chooseNovosibirsk();
    await messagerequest._chooseOfficeAndWaitGroupLoading(nogroup, groupName);
    body.style.display = '';
    if (nogroup) return;
    await messagerequest._clickDropdownItem(groupName);
  },
  async _chooseNovosibirsk() {
    const NSKdiv = claim(type.element, await pollingSelector(document, '#cityItemBtn_2') );
    affirm(NSKdiv.innerText.includes('НСК'), 'Не найдена кнопка НСК');
    NSKdiv.dispatchEvent(new Event('click'));
  },
  async _chooseOfficeAndWaitGroupLoading(nogroup, groupName) {
    const officeCtrl0 = claim(type.element, await pollingSelector(document, '#officeCtrl_0') );
    const input = claim(type.element, await pollingSelector(officeCtrl0, 'input') );
    input.value = 'сервис';
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.dispatchEvent(new Event('click', {bubbles:true}));
    const dropdowns = claim(type.nodeList, await pollingSelectorAll(document, 'cdek-dropdown', 4) );
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
    const groupCtrl0 = claim(type.element, await pollingSelector(document, '#groupCtrl_0') );
    const cdekCommonContolGroup = claim(type.element, await pollingSelector(groupCtrl0, 'cdek-common-control') );
    await until(() => {
      cdekCommonContolGroup.dispatchEvent(new Event('click'));
      return dropdowns[0].parentElement.innerText.includes(groupName)
    });
  },
  async _clickDropdownItem(name) {
    const cdekDropdownList = claim(type.nodeList, await pollingSelectorAll(document, 'cdek-dropdown', 2) );
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
        item.dispatchEvent(new Event('click'), {bubbles:true});
        break;
      }
    }
  },
  async establishCreateFormCompleteButtonsTabAutoClosing() {
    const closeFormBtn = claim(type.element, await pollingSelector(document, '#closeFormBtn') );
    const sendFormBtn = claim(type.element, await pollingSelector(document, '#sendFormBtn') );
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
      const officeCode = event.target.value;
      if (event.key !== 'Enter' || event.repeat) return;
      await until( () => event.target.value.length === 0);
      findButton.dispatchEvent(new Event('click'));
      await until( () => agCenterColsClipper.innerText.includes(officeCode));
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
const gateway = {
    //let a = await gateway.request('GET', 'https://gateway.cdek.ru/single-advice-window/web/order-details/get-order-clients/10053439295', null, location.origin, tools.getAuthToken());
    //let b = await a.json();
  request(method, url, body, referrer, token) {
    return fetch(url, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
        "pwt": token,
        "sec-ch-ua": "\"Microsoft Edge\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-auth-token": token,
        "x-user-lang": "rus"
      },
      "referrer": referrer,
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": body,
      "method": method,
      "mode": "cors",
      "credentials": "omit"
    });
  },

};
attempt( main.run.bind(main), tools.defaultCatchCallback.bind(tools, location.host) );
