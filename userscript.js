// ==UserScript==
// @name         optimism: cdek/contact-centre
// @namespace    http://tampermonkey.net/
// @version      2024-11-02
// @description  try to take over the world!
// @author       You
// @match        https://*/*

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
  setValue(name, value) {
    usercfg.data[name] = value;
    GM_setValue('usercfg', JSON.stringify(usercfg.data));
  },
};
const cfg = {
  domainWhiteList: [
      'svvs.contact-centre.ru', 'ek5.cdek.ru', 'preorderec5.cdek.ru', 'singleadvicewindowng.cdek.ru',
      //'messagerequestscreateformng.cdek.ru',
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
      // menu.establish();
    }
    if (domain === 'singleadvicewindowng.cdek.ru') {
      eok.establishCollapsedAreasAutoOpening();
      eok.markMultiplePlaces();
    }
    if (domain === 'preorderec5.cdek.ru' && !location.href.includes('gate.html')) {
      await preorder.resetRequestFilter();
      const splittedHref = location.href.split('/');
      const item = splittedHref.pop(); // id or string
      if (!isFinite(item)) return;
      await preorder.setFilterValue(item);
    }
    if (domain === 'messagerequestscreateformng.cdek.ru') {
      // await messagerequest.chooseDefaultBranch();
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
        const scriptChoice = menu.prompt([
          'ЕОК: Автоматическое открытие областей об оплате и грузоместах',
          'ЕОК: Окрашивание блока о готовых к выдаче местах, если в заказе более 1 места',
          'Журнал заявок: Автоматический сброс фильтров',
          'Журнал заявок: Инъекция идентификатора заявки в поле фильтра',
        ]);
        if (scriptChoice === null) return;

      }
    });
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
  async markMultiplePlaces() {
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
      if (splitted.pop() === '1') {
        sibling.style.backgroundColor = '';
        return;
      }
      sibling.style.backgroundColor = 'orange';
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
  async chooseDefaultBranch () {
    await messagerequest._chooseManualOfficeMode();
    await messagerequest._chooseNovosibirsk();
  },
  async _chooseManualOfficeMode() {
    const cdekCommonControlList = claim(type.nodeList, await pollingSelectorAll(document, 'cdek-common-control') );

    const cdekDropdownList0 = claim(type.nodeList, await pollingSelectorAll(document, 'cdek-dropdown', 2) );
    let dropdown0;
    for (let node of cdekDropdownList0) {
      if (node.innerHTML.includes('вручную')) {
        dropdown0 = node
        break;
      }
    }
    affirm(type.element(dropdown0), 'Не удалось определить dropdown0');
    for (let item of dropdown0.children) {
      if (item.innerHTML.includes('вручную')) {
        item.dispatchEvent(new Event('click'));
        break;
      }
    }
  },
  async _chooseNovosibirsk() {
    const appTopCityList = claim(type.element, await pollingSelector(document, 'app-top-city-list') );
    const buttons = claim(type.nodeList, await pollingSelectorAll(document, 'button') );
    let NSKbutton;
    for (let button of buttons) {
      if (button.innerText.includes('НСК')) {
        NSKbutton = button;
      }
    }
    affirm(type.element(NSKbutton), 'Не найдена кнопка НСК');
    NSKbutton.dispatchEvent(new Event('click'));
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
