$(function() {

  const days = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  }

  function getOrder() {
    return JSON.parse(window.localStorage.getItem("current-order-" + window.restaurant.uid) || '{}')
  }

  function setOrder(order) {
    window.localStorage.setItem('current-order-' + window.restaurant.uid, JSON.stringify(order));
  }

  function makeMap(resto) {
    if (resto.location) {
      let map = L.map('resto-map').setView([resto.location.lat, resto.location.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([resto.location.lat, resto.location.lng]).addTo(map)
          .bindPopup(resto.name)
          .openPopup();
    } else {
      $('#resto-map').remove();
    }
  }

  function makeHours(resto) {
    $('.resto-hours').html(Object.keys(resto.hours).map(key => {
      const day = resto.hours[key];
      const dayStr = days[key];
      return '<div>' + dayStr + ': ' + day.map(d => `${d.from} - ${d.to}`).join(', ') + '</div>';
    }).join('\n'));
  }

  function makePhotos(resto) {
    if (resto.photos.length > 0) {
      $('.resto-photos').html(`
      <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
        ${resto.photos.map((url, idx) => `<div class="carousel-item ${idx === 0 ? 'active' : ''}">
        <img src="${url}" class="carouphoto d-block w-100">
      </div>`).join('\n')}
        </div>
      </div>`);
      new bootstrap.Carousel($('.resto-photos #carouselExampleIndicators')[0])
    }
  }

  function makeMenus(resto) {
    const content = resto.menus.map(menu => {

      const order = getOrder();

      let desc = "";
      const starters = (menu.starters || []).map(e => _.find(resto.carte,  d => d.uid === e.ref))
      const mains = (menu.main || []).map(e => _.find(resto.carte, d => d.uid === e.ref))
      const desserts = (menu.dessert || []).map(e => _.find(resto.carte,  d => d.uid === e.ref))
      const others = (menu.other || []).map(e => _.find(resto.carte,  d => d.uid === e.ref))

      function addSection(arr, name) {
        if (arr.length > 0) {
          desc = desc + '<br/>' + name + '<br/><br/>'
          arr.map(s =>  desc = desc + '- ' + s.name + '<br/>');
        }
      }

      addSection(starters, 'Entrée');
      addSection(mains, 'Plat');
      addSection(desserts, 'Dessert');
      addSection(others, 'Autre');

      return `<div class="col-md-4">
        <div class="card mb-4 shadow-sm">
          <div style="width: 100%; display: flex; justify-content: center; align-items: center; background-color: #55595c; color: #fff; height: 100px;">
            <span>${menu.name}</span>
          </div>
          
          <div class="card-body">
            <p class="card-text">${desc}</p>
            <div class="d-flex justify-content-between align-items-center flex-row ">
              <button type="button" class="btn btn-sm btn-outline-secondary btn-menu" data-menu-name="${menu.name}" data-menu-id="${menu.uid}" data-menu-price="${menu.price}" >Commander</button>
              <small class="text-muted">${menu.price} €</small>
              <input type="number" name="${menu.name}" id="menu_${menu.uid}_quantity" value="${(order[menu.uid] || { quantity: 0}).quantity}" style="width: 50px"></input>
            </div>
            
          </div>
        </div></div>`
    }).join('\n');
    $('.resto-menus').html(content)
  }

  function makeCarte(resto) {
    const order = getOrder();
    const content = resto.carte.map(dish => {
      return `<div class="col-md-4">
        <div class="card mb-4 shadow-sm">
          <div style="width: 100%; display: flex; justify-content: center; align-items: center; background-color: #55595c; color: #fff; height: 200px; max-height: 200px;">
            <img src="${dish.photos[0]}" style="width: 100%; height: 200px; max-height: 200px"></img> 
          </div>
          <div class="card-body">
            <p class="card-text">${dish.name}</p>
            <p class="card-text" style="min-height: 150px">${dish.description}</p>
            <div class="d-flex justify-content-between align-items-center flex-row ">
              <button type="button" class="btn btn-sm btn-outline-secondary btn-dish" data-dish-name="${dish.name}" data-dish-id="${dish.uid}" data-dish-price="${dish.price}">Commander</button>
              <small class="text-muted">${dish.price} €</small>
              <input type="number" name="${dish.name}" id="dish_${dish.uid}_quantity" value="${(order[dish.uid] || { quantity: 0}).quantity}" style="width: 50px"></input>
            </div>
          </div>
        </div></div>`
    }).join('\n');
    $('.resto-carte').html(content)
  }

  function makeOrder(resto) {
    const order = getOrder();
    const keys = Object.keys(order);
    const total = keys.map(k => order[k].price * order[k].quantity).reduce((a, b) => a + b, 0);
    const quantity = keys.map(k => order[k].quantity).reduce((a, b) => a + b, 0);
    const content = `<ul class="list-group mb-3">
      ${keys.map(k => order[k]).map(product => {
        return `<li class="list-group-item d-flex justify-content-between lh-condensed">
          <div>
            <h6 class="my-0">${product.name}</h6>
            <small class="text-muted">${product.quantity} x ${product.price} €</small>
          </div>
          <span class="text-muted">${product.price * product.quantity} €</span>
        </li>`;
      }).join('\n')}
      <li class="list-group-item d-flex justify-content-between">
        <span>Total</span>
        <strong>${total} €</strong>
      </li>
    </ul>`;
    $('#order').html(content);
    $('#order-count').html(quantity);
    $('#order-button').html('Commander <span class="badge badge-secondary badge-pill">' + quantity + '</span>');
  }

  function drawPage(resto) {
    Object.keys(resto).map(name => {
      if (_.isString(resto[name])) {
        $('.resto-' + name).text(resto[name])
      }
    });
    makeHours(resto);
    makeMap(resto);
    makePhotos(resto);
    makeMenus(resto)
    makeCarte(resto)
  }

  window.restaurant = null;
  fetch('./data.json').then(r => r.json()).then(json => {
    window.restaurant = json;
    drawPage(json);
    makeOrder(json);
    $('#hidden').html(`
      <input type="hidden" name="Restaurant uid" value="${json.uid}"></input>
      <input type="hidden" name="Restaurant name" value="${json.name}"></input>
      <input type="hidden" name="Restaurant email" value="${json.email}"></input>
    `)
  });

  $('body').on('click', '.btn-dish', function() {
    const uid = $(this).data('dish-id');
    const name = $(this).data('dish-name');
    const price = $(this).data('dish-price');
    const selector = '[id=dish_' + uid + '_quantity]';
    const quantity = parseInt($(selector).val() || '0', 10);
    $(selector).val(quantity + 1);
    const order = getOrder();
    order[uid] = { name: name, quantity: quantity + 1, price };
    setOrder(order);
    makeOrder(window.restaurant);
  });

  $('body').on('click', '.btn-menu', function() {
    const uid = $(this).data('menu-id');
    const name = $(this).data('menu-name');
    const price = $(this).data('menu-price');
    const selector = '[id=menu_' + uid + '_quantity]'
    const quantity = parseInt($(selector).val() || '0', 10);
    $(selector).val(quantity + 1)
    const order = getOrder()
    order[uid] = { name: name, quantity: quantity + 1, price };
    setOrder(order);
    makeOrder(window.restaurant);
  });

  $('#submit').on('click', () => {
    window.localStorage.removeItem('current-order-' + window.restaurant.uid);
  });

});