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

let cur_time = new Date();

console.log(id);

function format_time(time) {
  let formatted_minutes, formatted_hours;
  (time.getHours().length < 2) ? formatted_hours = `0${time.getHours()}` : formatted_hours = `${time.getHours()}`;
  (time.getMinutes().length < 2) ? formatted_minutes = `0${time.getMinutes()}` : formatted_minutes = `${time.getMinutes()}`;
  return `${formatted_hours}:${formatted_minutes}`
}

function get_timezone() {
  return new Date(new Date().setUTCHours(0)).getHours();
}

function render_timeline(member) {
  let member_elem = document.getElementById(`${member.id}`);
  member_elem.insertAdjacentHTML('beforeend', `
  <table class="app-timezones__timeline">
    <tr class="app-timezones__line">
    </tr>
  </table>`);
  let line = member_elem.querySelector('.app-timezones__line');
  let line_date = new Date(new Date().setUTCHours(member.tz));
  for (let i = 6; i > 0; i--) {
    line.insertAdjacentHTML('beforeend', `
      <td class="app-timezones__time">${new Date(new Date(line_date).setHours(line_date.getHours()-i)).getHours()}:00</td>`)
  }
  for (let i = 0; i < 6; i++) {
    line.insertAdjacentHTML('beforeend', `
      <td class="app-timezones__time">${new Date(new Date(line_date).setHours(line_date.getHours()+i)).getHours()}:00</td>`)
  }
}

function render_member(member) {
  let list = document.querySelector('.app-timezones__list-members');

  list.insertAdjacentHTML('beforeend', `
    <li id="${member.id}" class="app-timezones__member">
      <h3 class="app-timezones__member-name">${member.name}</h3>
      <p class="app-timezones__current-time">times</p>
      <p class="app-timezones__city">${member.city}</p>
    </li>`);
  render_timeline(member);
  let member_elem = document.getElementById(`${member.id}`);
  let times = Array.from(member_elem.querySelectorAll('.app-timezones__time'));

  times.forEach(time => member.worktime.includes(time.textContent) ? time.classList.add('apptimezones__time--work') : '');
}

let btn = document.querySelector('.app-member__form-btn');
btn.addEventListener('click', function (evt) {
  evt.preventDefault();
  let name = document.querySelector('.app-member__input-name').value;
  let surname = document.querySelector('.app-member__input-surname').value;
  let city = document.querySelector('.app-member__input-city').value;
  let tzs = Array.from(document.querySelector('.utc'));
  let tz = tzs.filter(option => option.selected)[0].value;
  console.log(tz);
  let checkboxes = Array.from(document.querySelectorAll('.app-member__shedule-checkbox:checked'));
  let worktime = [];
  checkboxes.forEach(checkbox => worktime.push(checkbox.id));

  ++id;
  console.log(id);
  let member = {
    name: name,
    surname: surname,
    city: city,
    tz: tz,
    id: id,
    worktime: worktime,
  };
  console.log(member.worktime);


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
})
