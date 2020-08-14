'use strict'

const get_data = () => JSON.parse(localStorage.getItem('members'));
const post_data = (obj) => localStorage.setItem('members', JSON.stringify(obj));

if (localStorage.getItem('members') && JSON.parse(localStorage.getItem('members').length !== 0)) {
  let members = get_data();
  members.forEach(member => render_member(member));
  var id = members[members.length-1].id;
} else {
  var id = 0;
}

let shedule = {};

function check_shedule(day, worktime) {
  if (day.checked && !shedule.hasOwnProperty(day.value)) {
    shedule[`${day.value}`] = worktime;
  } else if (shedule.hasOwnProperty(day.value)){
    for (let i = 0; i < worktime.length; i++) {
      if (!shedule[`${day.value}`].includes(worktime[i])) {
        shedule[`${day.value}`].push(worktime[i]);
      }
    }
  }
  shedule[`${day.value}`].sort();
  render_shedule(day);
}

function render_shedule(day) {
  let work_day = document.getElementById(`day-${day.value}`);
  if (!work_day.querySelector('.app-member__checked-hours')) work_day.insertAdjacentHTML('beforeend', `
    <ul class="app-member__checked-hours">
    </ul>`);
  let work_shedule = work_day.querySelector('.app-member__checked-hours');
  let work_day_hours = Array.from(work_shedule.querySelectorAll('.app-member__time-of-work')).map(elem => elem.textContent).sort();
  shedule[`${day.value}`].forEach(function (time) {
    if (!work_day_hours.includes(time)) work_shedule.insertAdjacentHTML('beforeend', `
    <li class="app-member__time-of-work">${time}</li>`);
  });
  if (!work_day.querySelector('.app-member__delete-day')) work_shedule.insertAdjacentHTML('beforebegin', `
    <button onclick="delete_shedule('${day.value}')" class="app-member__delete-day" type="button">X</button>`);
}

function format_time(time, ...parameters) {
  let formatted_minutes, formatted_hours;
  (time.getHours() < 10) ? formatted_hours = `0${time.getHours()}` : formatted_hours = `${time.getHours()}`;
  (time.getMinutes() < 10) ? formatted_minutes = `0${time.getMinutes()}` : formatted_minutes = `${time.getMinutes()}`;
  return parameters[0] === 'm' ? `${formatted_minutes}` : parameters[0] === 'h' ? `${formatted_hours}:00` : `${formatted_hours}:${formatted_minutes}`
}

function get_time_of_zone(offset) {
  let date = new Date();
  let utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + offset * 3600000);
}

function get_day_of_zone(date) {
  let days_of_week = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days_of_week[date.getDay()];
}

function set_work_hours(member, line, line_date, offset_in_hours) {
  let time = new Date(new Date(line_date).setHours(line_date.getHours()+offset_in_hours));
  let correct_time = format_time(time, 'h');
  let day = get_day_of_zone(time);
  if (member.shedule.hasOwnProperty(day) && member.shedule[`${day}`].includes(correct_time)) {
    line.insertAdjacentHTML('beforeend', `
      <td class="app-timezones__time app-timezones__time--work">${correct_time}</td>`);
  } else line.insertAdjacentHTML('beforeend', `
    <td class="app-timezones__time">${correct_time}</td>`);
}

function render_timeline(member) {
  let member_elem = document.getElementById(`${member.id}`);
  member_elem.insertAdjacentHTML('beforeend', `
  <table class="app-timezones__timeline" border>
    <tr class="app-timezones__line">
    </tr>
  </table>`);
  let line = member_elem.querySelector('.app-timezones__line');
  let line_date = get_time_of_zone(member.tz);
  for (let i = 6; i > 0; i--) {
    set_work_hours(member, line, line_date, -i);
  }
  for (let i = 0; i < 6; i++) {
    set_work_hours(member, line, line_date, i);
  }
  member_elem.querySelectorAll('.app-timezones__time')[6].classList.add('app-timezones__time--current');
}

function render_member(member) {
  let list = document.querySelector('.app-timezones__list-members');
  let current_date = get_time_of_zone(member.tz);

  list.insertAdjacentHTML('beforeend', `
    <li id="${member.id}" class="app-timezones__member">
      <h3 class="app-timezones__member-name">${member.name} ${member.surname}</h3>
      <p class="app-timezones__city">${member.city}</p>
      <p class="app-timezones__current-time">(${format_time(current_date)})</p>
      <button onclick="delete_member(${member.id})" class="app-timezones__delete-btn">Delete</button>
    </li>`);
  render_timeline(member);
}

function add_in_shedule() {
  let shedule_days = Array.from(document.querySelectorAll('.app-member__shedule-day-label'));
  let days = Array.from(document.querySelectorAll('.app-member__shedule-day'));
  let checkboxes = Array.from(document.querySelectorAll('.app-member__shedule-checkbox:checked'));
  let worktime = [];
  checkboxes.forEach(checkbox => worktime.push(checkbox.id));
  for (let i = 0; i <= 6; i++) {
    if (!shedule_days[i].classList.contains('app-member__shedule-day-label--work') && days[i].checked) {
      shedule_days[i].classList.add('app-member__shedule-day-label--work');
      check_shedule(days[i], worktime);
    } else if (shedule_days[i].classList.contains('app-member__shedule-day-label--work') && days[i].checked) {
      check_shedule(days[i], worktime);
    }
  }
  checkboxes.forEach(checkbox => checkbox.checked = false);
  days.forEach(day => day.checked === true? day.checked = false : day.checked = false);
  console.log(shedule);
}

function delete_shedule(day_id) {
  let work_day = document.getElementById(`day-${day_id}`);
  work_day.querySelector('.app-member__checked-hours').remove();
  work_day.querySelector('.app-member__shedule-day-label--work').classList.remove('app-member__shedule-day-label--work');
  work_day.querySelector('.app-member__delete-day').remove();
  delete shedule[`${day_id}`];
}

function clear_shedule() {
  let work_days = Array.from(document.querySelectorAll('.test-day'));
  work_days.forEach(function (item) {
    if (item.querySelector('.app-member__checked-hours')) {
      item.querySelector('.app-member__checked-hours').remove();
      item.querySelector('.app-member__shedule-day-label--work').classList.remove('app-member__shedule-day-label--work');
      item.querySelector('.app-member__delete-day').remove();
    }
  })

  shedule = {};
}

function add_member() {
  let name = document.getElementById('name').value;
  let surname = document.getElementById('surname').value;
  let city = document.getElementById('city').value;
  let tzs = Array.from(document.querySelectorAll('.utc__radio'));
  let tz = tzs.filter(option => option.checked)[0].value;

  ++id;
  let member = {
    name: name,
    surname: surname,
    city: city,
    tz: tz,
    id: id,
    shedule: shedule,
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

  clear_shedule();

  console.log(member);
}

function delete_member(member_id) {
  let members = get_data();
  members.forEach(function (member, i) {
    if (member.id === member_id) members.splice(i, 1);
  })
  post_data(members);

  document.getElementById(`${member_id}`).remove();

  if (members.length != 0) id = members[members.length-1].id;
  else id = 0;
}

let btn_add = document.querySelector('.app-navigation__btn--add');
btn_add.addEventListener('click', function () {
  let modal_add = document.querySelector('.app-member');
  modal_add.classList.add('app-member--show');

  let btn_close = modal_add.querySelector('.app-member__btn-close');
  btn_close.addEventListener('click', function() {
    modal_add.classList.remove('app-member--show');
  })

  let required_label = modal_add.querySelector('.required-label');
  if (required_label.classList.contains('required-label--show')) required_label.classList.remove('required-label--show');

  let name_input = document.getElementById('name');
  name_input.addEventListener('change', function() {
    let required_label = modal_add.querySelector('.required-label');
    if (required_label.classList.contains('required-label--show')) required_label.classList.remove('required-label--show');
  })
  name_input.focus();

  let shedule_btn = modal_add.querySelector('.app-member__shedule-btn');
  shedule_btn.addEventListener('click', add_in_shedule);

  let form_btn = document.querySelector('.app-member__form-btn');
  form_btn.addEventListener('click', function(evt) {
    evt.preventDefault();
    let required_label = modal_add.querySelector('.required-label');
    if (!name_input.value) {
      required_label.classList.add('required-label--show');
      name_input.focus();
    } else {
        form_btn.addEventListener('click', add_member());
        document.querySelector('.app-member__form').reset();
        modal_add.classList.remove('app-member--show');
    }
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
