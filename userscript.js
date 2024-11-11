// ==UserScript==
// @name         optimism: cdek/contact-centre
// @namespace    http://tampermonkey.net/
// @version      2024-11-10
// @description  workflow optimisation for ek5 and contact-centre
// @author       Ton
// @match        https://ek5.cdek.ru/*
// @match        https://svvs.contact-centre.ru/*
// @match        https://preorderec5.cdek.ru/*
// @match        https://singleadvicewindowng.cdek.ru/*
// @match        https://messagerequestscreateformng.cdek.ru/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// ==/UserScript==
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
    'messagerequestscreateformng.cdek.ru',
  ],
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
const addSafeListener = function (element, eventType, callback) {
  return element.addEventListener(
    eventType, event => {
      attempt(() => callback(event), tools.defaultCatchCallback);
    }
  );
};
const addSafeObserver = function (element, options, callback) {
  const mo = new MutationObserver( (records, mo) => {
    attempt(null, () => callback(records, mo), tools.defaultCatchCallback);
  });
  mo.observe(element, options);
  return mo;
};
const setSafeInterval = function (callback, intervalMs) {
  return setInterval(attempt.bind(null, callback, tools.defaultCatchCallback), intervalMs);
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
        reject(new Error('Превышено время ожидания pollingSelector.'));
      }
      console.log('wfo polling selector: ', selector)
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
        reject(new Error('Превышено время ожидания pollingSelectorAll.'));
      }
      console.log('wfo polling selector all: ', selector)
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
  object: item => type.of(item) === '[object object]',
};
const tools = {
  defaultCatchCallback(error) {
    alert("Ошибка в юзерскрипте:\n\n" + error.stack);
  },
  pause(intervalMs) {
    return new Promise(resolve => {
      setTimeout(resolve, intervalMs);
    });
  },

};
const main = {
  async run() {
    const domain = main.getDomainFromWhiteList(location.href);
    if (domain === false) return;
    usercfg.loadFromStorage();
    await main.manageScripts(domain);
  },
  async manageScripts(domain) {
    if (domain === 'svvs.contact-centre.ru') {
      // svvs.establishAutoupdate();
    }
    if (domain === 'ek5.cdek.ru') {
      menu.establish();
    }
    if (domain === 'singleadvicewindowng.cdek.ru') {
      if (usercfg.data.collapsedAreasAutoOpening === undefined || (usercfg.data.collapsedAreasAutoOpening && usercfg.data.collapsedAreasAutoOpening.active !== false)) {
        eok.establishCollapsedAreasAutoOpening();
      }
      if (usercfg.data.multiplePlacesMarking === undefined || (usercfg.data.multiplePlacesMarking && usercfg.data.multiplePlacesMarking.active !== false)) {
        eok.markMultiplePlaces2();
      }
      if (usercfg.data.notificationBlockMessagerequestTabAutoOpening === undefined || (usercfg.data.notificationBlockMessagerequestTabAutoOpening && usercfg.data.notificationBlockMessagerequestTabAutoOpening.active !== false)) {
        eok.establishNotificationBlockMessagerequestTabAutoOpening();
      }
    }
    if (domain === 'preorderec5.cdek.ru' && !location.href.includes('gate.html')) {
      if (usercfg.data.requestFilterReset === undefined || (usercfg.data.requestFilterReset && usercfg.data.requestFilterReset.active !== false)) {
        await preorder.resetRequestFilter();
      }
      const splittedHref = location.href.split('/');
      const item = splittedHref.pop(); // id or string
      if (!isFinite(item)) return;
      if (usercfg.data.requestFilterValueSet && usercfg.data.requestFilterValueSet.active !== false) {
        await preorder.setFilterValue(item);
      }
    }
    if (domain === 'messagerequestscreateformng.cdek.ru') {
      if (usercfg.data.messagerequestDefaultBranchChoosing === undefined || (usercfg.data.messagerequestDefaultBranchChoosing && usercfg.data.messagerequestDefaultBranchChoosing.active !== false)) {
        await messagerequest.establishDefaultBranchChoosing();
      }
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
    addSafeListener(document, 'keydown', event => {
      if (!event.altKey || event.key !== 'End' || event.repeat) return;
      const mainChoice = menu.prompt(['Активация/деактивация скриптов']);
      if (mainChoice === null) return;
      if (mainChoice === 1) {
        menu.scriptToggling();
        return;
      }
    });
  },
  scriptToggling() {
    const scriptChoice = menu.prompt([
      menu.get_isActive_prefix('collapsedAreasAutoOpening') + 'ЕОК: Автоматическое открытие областей об оплате и грузоместах',
      menu.get_isActive_prefix('multiplePlacesMarking') + 'ЕОК: Окрашивание селекта мест, если в заказе более 1 места',
      menu.get_isActive_prefix('notificationBlockMessagerequestTabAutoOpening') + 'ЕОК: Автоматическое открытие вкладки сообщений-запросов',
      menu.get_isActive_prefix('requestFilterReset') + 'Журнал заявок: Автоматический сброс фильтров',
      menu.get_isActive_prefix('requestFilterValueSet') + 'Журнал заявок: Инъекция идентификатора заявки в поле фильтра',
      menu.get_isActive_prefix('messagerequestDefaultBranchChoosing') + 'Окно создания СЗ: Alt+End открывает меню выбора ветви',
    ]);
    if (scriptChoice === 0) return;
    menu.toggleScriptInUsercfg(scriptChoice);
    alert('Для применения изменений обновите страницу.');
  },
  toggleScriptInUsercfg(n) {
    n--;
    const scriptNames = [
      'collapsedAreasAutoOpening','multiplePlacesMarking',
      'notificationBlockMessagerequestTabAutoOpening', 'requestFilterReset',
      'requestFilterValueSet', 'messagerequestDefaultBranchChoosing',
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
	  text += n + ') ' + option + '\n';
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
const ek5 = {};
const eok = {
  async establishCollapsedAreasAutoOpening() {
    const body = await pollingSelector(document, 'body');
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, async records => {
      if (records[0].oldValue !== 'overflowHidden') return;
      const collapsePaymentBtn = claim(type.element, await pollingSelector(document, '#CollapsePaymentBtn') );
      const collapsePlacesBtn = claim(type.element, await pollingSelector(document, '#CollapsePlacesBtn') );
      const appCards = claim(type.nodeList, document.querySelectorAll('app-card')); // no need pollingSelector, appCards are parents of buttons
      affirm(appCards.length === 2, 'Обнаружено более или менее двух app-card.');
      const paymentIntervalId = setSafeInterval( () => {
        if (appCards[0].className.includes('collapsed')) {
          collapsePaymentBtn.dispatchEvent(new Event('click'));
          return;
        }
        clearInterval(paymentIntervalId);
      }, 500);
      const placesIntervalId = setSafeInterval( () => {
        if (appCards[1].className.includes('collapsed')) {
          collapsePlacesBtn.dispatchEvent(new Event('click'));
          return;
        }
        clearInterval(placesIntervalId);
      }, 500);
    });
  },
  async markMultiplePlaces() { // disactivated
    const body = await pollingSelector(document, 'body');
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, async records => {
      if (records[0].oldValue !== 'overflowHidden') return;
      const titleDivs = claim(type.nodeList, await pollingSelectorAll(document, 'div[class=title]', 15) );
      let placesTitleDiv;
      for (let div of titleDivs) {
        if (div.innerText.includes('отово к выдаче')) {
          placesTitleDiv = div;
          break;
        }
      }
      affirm(type.element(placesTitleDiv), "Не обнаружен placesTitleDiv.");
      const sibling = claim(type.element, placesTitleDiv.nextElementSibling);
      affirm(sibling.innerText.includes(' из '), 'placesTitleDiv.nextElementSibling.innerText не содержит " из ".');
      const splitted = sibling.innerText.split(' из ');
      if (splitted.pop() === '1' || sibling.innerText.includes('из 1')) {
        sibling.style.backgroundColor = 'white';
        return;
      }
      sibling.style.backgroundColor = 'orange';
    });
  },
  async markMultiplePlaces2() {
    const body = await pollingSelector(document, 'body');
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, async records => {
      if (records[0].oldValue !== 'overflowHidden') return;
      const placeSelect = claim(type.element, await pollingSelector(document, '#PlaceSelect'));
      const divControl = claim(type.element, await pollingSelector(placeSelect, 'div.control'));
      const dropdownItems = claim(type.nodeList, await pollingSelectorAll(placeSelect, 'cdek-dropdown-item', 1));
      if (dropdownItems.length < 2) {
        divControl.style.backgroundColor = 'white';
        return;
      }
      divControl.style.backgroundColor = '#FFECA1';
    });
  },
  async establishNotificationBlockMessagerequestTabAutoOpening() {
    const body = await pollingSelector(document, 'body');
    addSafeObserver(body, { attributes:true, attributeOldValue:true }, async records => {
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
  async establishDefaultBranchChoosing() {
    addSafeListener(document.body, 'keydown', async event => {
      if (!event.altKey || event.key !== 'End' || event.repeat) return;
      const choice = menu.prompt([
        'НСК > CК > Претензии от операторов', 'НСК > CК > Заявки на изменения наклданой', 'НСК > CК > Запрос документов'
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
    input.blur();
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
};
const svvs = {
  async establishAutoupdate() {
    const storedOperatorDayTableInnerText = GM_getValue('operatorDayTableInnerText');
    const operatorDayTable = claim(type.element, await pollingSelector(document, '.operator-day') );
    if (storedOperatorDayTableInnerText !== operatorDayTable.innerText) {
      if (document.hasFocus()) {
        alert('Перерывы изменились.');
        setTimeout(() => { location.href = location.href }, 8000);
      }
      else {
        const title = document.querySelector('title');
        const intervalId = svvs.startTitleToggling(title, 500);
        addSafeListener(window, 'focus', () => {
          svvs.stopTitleToggling(title, intervalId);
          setTimeout(() => { location.href = location.href }, 8000);
          //alert('Перерывы изменились.');
        })
      }
    }
  },
   toggleTitle(titleElement, a, b) {
     if (titleElement.innerText === a) {
       titleElement.innerText = b;
       return;
     }
     titleElement.innerText = a;
   },
   startTitleToggling(titleElement, intervalMs) {
     return setSafeInterval(
       svvs.toggleTitle.bind(svvs, titleElement, 'Изменение!', '-'),
       intervalMs
     );
   },
   async stopTitleToggling(titleElement, intervalId) {
     clearInterval(intervalId);
     await tools.pause(2000);
     titleElement.innerText = 'СВВС';
   },
};
attempt( main.run.bind(main), tools.defaultCatchCallback.bind(tools) );
