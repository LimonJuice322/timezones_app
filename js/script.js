'use strict'

const get_data = () => JSON.parse(localStorage.getItem('members'));
const post_data = (obj) => localStorage.setItem('members', JSON.stringify(obj));

if (localStorage.getItem('members')) {
  let members = get_data();
  members.forEach(member => render_member(member));
  var id = members[members.length-1].id;
} else {
  var id = 0;
}

function format_time(time, ...parameters) {
  let formatted_minutes, formatted_hours;
  (time.getHours() < 10) ? formatted_hours = `0${time.getHours()}` : formatted_hours = `${time.getHours()}`;
  (time.getMinutes() < 10) ? formatted_minutes = `0${time.getMinutes()}` : formatted_minutes = `${time.getMinutes()}`;
  return parameters[0] === 'm' ? `${formatted_minutes}` : parameters[0] === 'h' ? `${formatted_hours}` : `${formatted_hours}:${formatted_minutes}`
}

function get_time_of_zone(offset) {
  let date = new Date();
  let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + offset * 3600000);
}

function render_timeline(member) {
  let member_elem = document.getElementById(`${member.id}`);
  member_elem.insertAdjacentHTML('beforeend', `
  <table class="app-timezones__timeline">
    <tr class="app-timezones__line">
    </tr>
  </table>`);
  let line = member_elem.querySelector('.app-timezones__line');
  let line_date = get_time_of_zone(member.tz);
  for (let i = 6; i > 0; i--) {
    let time = new Date(new Date(line_date).setHours(line_date.getHours()-i));
    line.insertAdjacentHTML('beforeend', `
      <td class="app-timezones__time">${format_time(time, 'h')}:00</td>`);
  }
  for (let i = 0; i < 6; i++) {
    let time = new Date(new Date(line_date).setHours(line_date.getHours()+i));
    line.insertAdjacentHTML('beforeend', `
      <td class="app-timezones__time">${format_time(time, 'h')}:00</td>`);
  }
}

function render_member(member) {
  let list = document.querySelector('.app-timezones__list-members');

  list.insertAdjacentHTML('beforeend', `
    <li id="${member.id}" class="app-timezones__member">
      <h3 class="app-timezones__member-name">${member.name}</h3>
      <p class="app-timezones__current-time">${format_time(get_time_of_zone(member.tz))}</p>
      <p class="app-timezones__city">${member.city}</p>
    </li>`);
  render_timeline(member);
  let member_elem = document.getElementById(`${member.id}`);
  let times = Array.from(member_elem.querySelectorAll('.app-timezones__time'));

  times.forEach(time => member.worktime.includes(time.textContent) ? time.classList.add('apptimezones__time--work') : '');
}

function add_member() {
  let name = document.getElementById('name').value;
  let surname = document.getElementById('surname').value;
  let city = document.getElementById('city').value;
  let tzs = Array.from(document.querySelectorAll('.utc__radio'));
  let tz = tzs.filter(option => option.checked)[0].value;
  let checkboxes = Array.from(document.querySelectorAll('.app-member__shedule-checkbox:checked'));
  let worktime = [];
  checkboxes.forEach(checkbox => worktime.push(checkbox.id));

  ++id;
  let member = {
    name: name,
    surname: surname,
    city: city,
    tz: tz,
    id: id,
    worktime: worktime,
  };


  if (localStorage.getItem('members')) {
    let members = get_data();
    members.push(member);
    post_data(members);
    render_member(member);
  } else {
    let members = new Array(member);
    post_data(members);
    render_member(member);
  }
}

let btn_add = document.querySelector('.app-navigation__btn--add');
btn_add.addEventListener('click', function () {
  let modal_add = document.querySelector('.app-member');
  modal_add.classList.add('app-member--show');

  let btn_close = modal_add.querySelector('.app-member__btn-close');
  btn_close.addEventListener('click', function() {
    modal_add.classList.remove('app-member--show');
  })

  let name_input = document.getElementById('name');
  name_input.addEventListener('change', function() {
    let required_label = modal_add.querySelector('.required-label');
    if (required_label.classList.contains('required-label--show')) required_label.classList.remove('required-label--show');
  })
  name_input.focus();

  let form_btn = document.querySelector('.app-member__form-btn');
  form_btn.addEventListener('click', function(evt) {
    evt.preventDefault();
    let required_label = modal_add.querySelector('.required-label');
    if (!name_input.value) required_label.classList.add('required-label--show');
    else {
      form_btn.addEventListener('click', add_member());
    }

    document.querySelector('.app-member__form').reset();
    name_input.focus();
  })

  let full_utc = modal_add.querySelector('.utc');
  let current_utc = document.querySelector('.app-member__current-timezone');
  current_utc.addEventListener('click', function() {
    document.addEventListener('click', function(evt) {
      if (evt.target == current_utc) {
        full_utc.classList.add('utc--show')
      } else if (!full_utc.contains(evt.target) && full_utc.classList.contains('utc--show')) {
        full_utc.classList.remove('utc--show');
      }
    })
  })

  let list_utc = document.querySelectorAll('.utc__label');
  list_utc.forEach(elem => elem.addEventListener('click', function() {
    current_utc.textContent = `UTC ${elem.htmlFor}:00`;
    full_utc.classList.remove('utc--show');
  }))
})
