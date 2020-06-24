// получение объектов
const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
    inputCitiesTo = formSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = formSearch.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets'),
    headerTitle = document.querySelector('h1');
// база городов
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  proxy = 'https://cors-anywhere.herokuapp.com/',
  apiKey = 'ca234843a297a0d94c7fe7bf4e3b5d06',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload',
  MAX_COUNT = 10;
  let city = [];

// база городов из api 
const getData = (url, callBack, reject = console.error) => {
  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) return;
    if (request.status === 200){
      callBack(request.response);
    } else {
      reject(request.status);
    }
  });
    request.send(); 
};

// функции
const showCity = (input, list) => {
  list.textContent = '';
  if (input.value === '') return;

      const filterCity = city.filter((item) => {
          const fixItem = item.name.toLowerCase();
          return fixItem.startsWith(input.value.toLowerCase()); 
      });
      filterCity.forEach((item) => {
          const li = document.createElement('li');
          li.classList.add('dropdown__city');
          li.textContent = item.name;
          list.append(li);
      });
};

  const selectCity = (event, input, list) => {
      const target = event.target;
      if (target.tagName.toLowerCase() === 'li') {
          input.value =  target.textContent;
          list.textContent = '';
      }
  };
// рендер билетов за дату
  const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
// вызов и подставка билета
    const ticket = createCard(cheapTicket[0]);
// создание элемента на странице
    cheapestTicket.append(ticket);
  };

// рендер билетов за год
  const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
// функция сортировки по цене
    // cheapTicket.sort((a, b) => {
    //   if (a.value > b.value) {
    //     return 1;
    //   }
    //   if (a.value < b.value) {
    //     return -1;
    //   }
    //   return 0;
    // });
    cheapTickets.sort((a, b) => a.value - b.value);
// ограничение на 10 карт годовой и вывод на страницу
    for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i ++){
      const ticket = createCard(cheapTickets[i]);
      otherCheapTickets.append(ticket);
    } 

  };

  const getNameCity = (code) => {
    const objCity = city.find(item => item.code === code);
    return objCity.name;
  };

  const getDate = (date) => {
    return new Date(date).toLocaleString('ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
// получение числа пересадок
  const getChanges = (num) => {
    if (num){
      return num === 1 ? 'С одной пересадкой': 'С двумя пересадками';
    } else {
      return 'без пересадок';
    }
  }; 
// получение и конвертация даты
  const getLinkAviasales = (data) => {
    let link = 'https://www.aviasales.ru/search/';
    link += data.origin;
    const date = new Date(data.depart_date);
    const day = date.getDate();
    link += day < 10 ? '0' + day : day;
    const month = date.getMonth() + 1;
    link += month < 10 ? '0' + month : month;
    link += data.destination;
    link += '1';
    return link;
  }

  const createCard = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');
    let deep = '';
// создание и подставка дешового билета
    if (data){
      deep = `
        <h3 class="agent">${data.gate}</h3>
  <div class="ticket__wrapper">
    <div class="left-side">
      <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
        за ${data.value}₽</a>
    </div>
    <div class="right-side">
      <div class="block-left">
        <div class="city__from">Вылет из города
          <span class="city__name">${getNameCity(data.origin)}</span>
        </div>
        <div class="date">${getDate(data.depart_date)}</div>
      </div>

      <div class="block-right">
        <div class="changes">${getChanges(data.number_of_changes)}</div>
        <div class="city__to">Город назначения:
          <span class="city__name">${getNameCity(data.destination)}</span>
        </div>
      </div>
    </div>
  </div>
      `;
    } else {
      deep = '<h3>К сожелению на текущую дату билетов не нашлось!</h3>'
    }
    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
  };
  
const renderCheap = (data, date) => {
// получение билета за год
  const cheapTicketYear = JSON.parse(data).best_prices;
// получение билета за дату
  const cheapTicketday = cheapTicketYear.filter((item) => {
    
    return item.depart_date === date;
  })
  renderCheapYear(cheapTicketYear);
  renderCheapDay(cheapTicketday);
};

// обработка функции
  inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
  });

  inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
  });

  dropdownCitiesFrom.addEventListener('click', (event,) => {
    selectCity(event,inputCitiesFrom, dropdownCitiesFrom);
  });

  dropdownCitiesTo.addEventListener('click', (event,) => {
    selectCity(event,inputCitiesTo, dropdownCitiesTo);
  });

formSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    
// получение кода городов
    const formData = {
      // откуда
      from: city.find((item) => inputCitiesFrom.value === item.name),
      // куда
      to: city.find((item) => inputCitiesTo.value === item.name),
     // когда 
      when: inputDateDepart.value,
    };
// проверка если есть город то выполняет 
    if (formData.from && formData.to){
      const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}` +
      `&destination=${formData.to.code}&one_way=true`;
// старый способ
      // const requestData2 = '?depart_date=' + formData.when + 
      // '&origin=' + formData.from +
      // '&destination=' + formData.to +
      // '&one_way=true';
  
// возврат от сервера при запросе
        getData(calendar + requestData, 
          (data) => {
          renderCheap(data, formData.when);
          }, 
          error => {
          alert('В этом направлении нет рейсов');
          console.error('Ошибка', error);
        });
    } else {
      alert('введите корректное название города');
    }
  });
// вызовы функции отправка и получение
      getData(proxy + citiesApi, (data) => {
        city = JSON.parse(data).filter(item => item.name);
// сортировка полученных городов
        city.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        });
        });
  