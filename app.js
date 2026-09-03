(function () {
  "use strict";

  var STORAGE_KEY = "personalWeeklyRoster.v1";
  var dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var majorTimes = [0, 360, 720, 1080, 1440];
  var state = loadState();
  var activeView = "weekly";
  var selectedDate = new Date();

  var els = {
    periodTitle: document.getElementById("periodTitle"),
    previousPeriod: document.getElementById("previousPeriod"),
    nextPeriod: document.getElementById("nextPeriod"),
    todayBtn: document.getElementById("todayBtn"),
    addShiftBtn: document.getElementById("addShiftBtn"),
    manageWorkplacesBtn: document.getElementById("manageWorkplacesBtn"),
    viewTabs: document.querySelectorAll(".view-tab"),
    weeklyView: document.getElementById("weeklyView"),
    monthlyView: document.getElementById("monthlyView"),
    yearlyView: document.getElementById("yearlyView"),
    dayHeaderRow: document.getElementById("dayHeaderRow"),
    timeAxis: document.getElementById("timeAxis"),
    timeBoard: document.getElementById("timeBoard"),
    monthGrid: document.getElementById("monthGrid"),
    yearGrid: document.getElementById("yearGrid"),
    totalHours: document.getElementById("totalHours"),
    workplaceSummary: document.getElementById("workplaceSummary"),
    shiftModal: document.getElementById("shiftModal"),
    shiftForm: document.getElementById("shiftForm"),
    shiftModalTitle: document.getElementById("shiftModalTitle"),
    shiftId: document.getElementById("shiftId"),
    shiftWorkplace: document.getElementById("shiftWorkplace"),
    shiftDate: document.getElementById("shiftDate"),
    shiftStart: document.getElementById("shiftStart"),
    shiftEnd: document.getElementById("shiftEnd"),
    shiftError: document.getElementById("shiftError"),
    deleteShiftBtn: document.getElementById("deleteShiftBtn"),
    saveShiftBtn: document.getElementById("saveShiftBtn"),
    noWorkplaceNote: document.getElementById("noWorkplaceNote"),
    openWorkplacesFromShift: document.getElementById("openWorkplacesFromShift"),
    workplaceModal: document.getElementById("workplaceModal"),
    workplaceForm: document.getElementById("workplaceForm"),
    workplaceId: document.getElementById("workplaceId"),
    workplaceName: document.getElementById("workplaceName"),
    workplaceColor: document.getElementById("workplaceColor"),
    workplaceError: document.getElementById("workplaceError"),
    workplaceList: document.getElementById("workplaceList"),
    cancelWorkplaceEdit: document.getElementById("cancelWorkplaceEdit")
  };

  init();

  function init() {
    fillTimeOptions();
    bindEvents();
    render();
  }

  function bindEvents() {
    els.previousPeriod.addEventListener("click", function () {
      movePeriod(-1);
    });

    els.nextPeriod.addEventListener("click", function () {
      movePeriod(1);
    });

    els.todayBtn.addEventListener("click", function () {
      selectedDate = new Date();
      render();
    });

    els.viewTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeView = tab.dataset.view;
        render();
      });
    });

    els.addShiftBtn.addEventListener("click", function () {
      openShiftModal();
    });

    els.manageWorkplacesBtn.addEventListener("click", function () {
      openWorkplaceModal();
    });

    els.openWorkplacesFromShift.addEventListener("click", function () {
      closeModal("shiftModal");
      openWorkplaceModal();
    });

    els.shiftForm.addEventListener("submit", saveShiftFromForm);
    els.deleteShiftBtn.addEventListener("click", deleteCurrentShift);
    els.workplaceForm.addEventListener("submit", saveWorkplaceFromForm);
    els.cancelWorkplaceEdit.addEventListener("click", resetWorkplaceForm);

    document.querySelectorAll("[data-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeModal(button.getAttribute("data-close"));
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
      backdrop.addEventListener("click", function (event) {
        if (event.target === backdrop) closeModal(backdrop.id);
      });
    });
  }

  function render() {
    renderViewTabs();
    renderTitle();
    renderSummary();
    renderWorkplaceSelect();
    els.weeklyView.classList.toggle("hidden", activeView !== "weekly");
    els.monthlyView.classList.toggle("hidden", activeView !== "monthly");
    els.yearlyView.classList.toggle("hidden", activeView !== "yearly");

    if (activeView === "weekly") renderWeekly();
    if (activeView === "monthly") renderMonthly();
    if (activeView === "yearly") renderYearly();
  }

  function renderViewTabs() {
    els.viewTabs.forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.view === activeView);
    });
  }

  function renderTitle() {
    if (activeView === "weekly") {
      var monday = startOfWeek(selectedDate);
      var sunday = addDays(monday, 6);
      var text = formatRange(monday, sunday);
      els.periodTitle.textContent = isSameDate(monday, startOfWeek(new Date())) ? "This Week · " + text : text;
      return;
    }

    if (activeView === "monthly") {
      var monthText = selectedDate.toLocaleString("en", { month: "long", year: "numeric" });
      var today = new Date();
      var isThisMonth = selectedDate.getFullYear() === today.getFullYear() && selectedDate.getMonth() === today.getMonth();
      els.periodTitle.textContent = isThisMonth ? "This Month · " + monthText : monthText;
      return;
    }

    var year = selectedDate.getFullYear();
    els.periodTitle.textContent = year === new Date().getFullYear() ? "This Year · " + year : String(year);
  }

  function renderWeekly() {
    renderHeaders();
    renderTimeAxis();
    renderBoard();
  }

  function renderHeaders() {
    els.dayHeaderRow.innerHTML = "";
    getWeekDates().forEach(function (date, index) {
      var head = document.createElement("div");
      head.className = "day-head";
      head.innerHTML =
        '<div class="date-num">' + pad(date.getDate()) + '</div>' +
        '<div class="weekday">' + dayNames[index] + '</div>' +
        '<div class="chevron">⌄</div>';
      els.dayHeaderRow.appendChild(head);
    });
  }

  function renderTimeAxis() {
    els.timeAxis.innerHTML = "";
    majorTimes.forEach(function (minutes) {
      var label = document.createElement("div");
      label.className = "time-label";
      if (minutes === 0) label.classList.add("top");
      if (minutes === 1440) label.classList.add("bottom");
      label.style.top = minutesToPixels(minutes) + "px";
      label.textContent = formatTime(minutes);
      els.timeAxis.appendChild(label);
    });
  }

  function renderBoard() {
    els.timeBoard.innerHTML = "";

    getWeekDates().forEach(function (date) {
      var column = document.createElement("div");
      column.className = "day-column";
      column.dataset.date = toISODate(date);

      getShiftsForDate(toISODate(date)).forEach(function (shift) {
        column.appendChild(createShiftBlock(shift));
      });

      els.timeBoard.appendChild(column);
    });
  }

  function renderMonthly() {
    var monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    var gridStart = startOfWeek(monthStart);
    els.monthGrid.innerHTML = "";

    dayNames.forEach(function (day) {
      var weekday = document.createElement("div");
      weekday.className = "month-weekday";
      weekday.textContent = day;
      els.monthGrid.appendChild(weekday);
    });

    for (var index = 0; index < 42; index += 1) {
      var date = addDays(gridStart, index);
      var dateString = toISODate(date);
      var cell = document.createElement("div");
      cell.className = "month-day";
      if (date.getMonth() !== selectedDate.getMonth()) cell.classList.add("outside");
      cell.innerHTML = '<div class="month-date">' + date.getDate() + '</div>';

      getShiftsForDate(dateString).slice(0, 3).forEach(function (shift) {
        cell.appendChild(createMiniShift(shift));
      });

      var hiddenCount = Math.max(getShiftsForDate(dateString).length - 3, 0);
      if (hiddenCount > 0) {
        var more = document.createElement("div");
        more.className = "more-shifts";
        more.textContent = "+" + hiddenCount + " more";
        cell.appendChild(more);
      }

      els.monthGrid.appendChild(cell);
    }
  }

  function renderYearly() {
    els.yearGrid.innerHTML = "";
    for (var month = 0; month < 12; month += 1) {
      els.yearGrid.appendChild(createYearMonth(month));
    }
  }

  function createYearMonth(month) {
    var year = selectedDate.getFullYear();
    var monthStart = new Date(year, month, 1);
    var gridStart = startOfWeek(monthStart);
    var wrap = document.createElement("section");
    wrap.className = "year-month";
    wrap.innerHTML =
      '<h3>' + monthNames[month] + '</h3>' +
      '<div class="year-weekdays">' +
        '<span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>' +
      '</div>' +
      '<div class="year-days"></div>';

    var days = wrap.querySelector(".year-days");
    for (var index = 0; index < 42; index += 1) {
      var date = addDays(gridStart, index);
      var dateString = toISODate(date);
      var shifts = getShiftsForDate(dateString);
      var day = document.createElement("button");
      day.type = "button";
      day.className = "year-day";
      if (date.getMonth() !== month) day.classList.add("outside");
      if (isSameDate(date, new Date())) day.classList.add("today");
      day.textContent = date.getDate();

      if (shifts.length > 0) {
        var workplace = getWorkplace(shifts[0].workplaceId);
        day.classList.add("has-shift");
        day.style.backgroundColor = workplace ? workplace.color : "#7a7f86";
        day.title = shifts.length + " shift" + (shifts.length === 1 ? "" : "s");
        day.addEventListener("click", function (firstShift) {
          return function () {
            openShiftModal(firstShift.id);
          };
        }(shifts[0]));
      }

      days.appendChild(day);
    }

    return wrap;
  }

  function createShiftBlock(shift) {
    var workplace = getWorkplace(shift.workplaceId);
    var start = timeToMinutes(shift.start);
    var end = timeToMinutes(shift.end);
    var duration = Math.max(end - start, 15);
    var block = document.createElement("button");
    block.type = "button";
    block.className = "shift-block";
    if (duration < 75) block.classList.add("short-shift");
    block.style.top = minutesToPixels(start) + "px";
    block.style.height = minutesToPixels(duration) + "px";
    block.style.backgroundColor = workplace ? workplace.color : "#7a7f86";
    block.innerHTML =
      '<span class="shift-place">' + escapeHTML(workplace ? workplace.name : "Deleted workplace") + '</span>' +
      '<span class="shift-time">' + shift.start + '</span>' +
      '<span class="shift-time">' + shift.end + '</span>';
    block.addEventListener("click", function () {
      openShiftModal(shift.id);
    });
    return block;
  }

  function createMiniShift(shift) {
    var workplace = getWorkplace(shift.workplaceId);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mini-shift";
    button.style.backgroundColor = workplace ? workplace.color : "#7a7f86";
    button.textContent = shift.start + " " + (workplace ? workplace.name : "Shift");
    button.addEventListener("click", function () {
      openShiftModal(shift.id);
    });
    return button;
  }

  function renderSummary() {
    var range = getActiveRange();
    var shifts = getShiftsInRange(range.start, range.end);
    var totals = getTotals(shifts);
    var label = activeView === "weekly" ? "week" : activeView === "monthly" ? "month" : "year";
    els.totalHours.textContent = "Total hours this " + label + ": " + formatHours(totals.total) + " h";
    els.workplaceSummary.innerHTML = "";

    Object.keys(totals.byWorkplace).forEach(function (id) {
      var workplace = getWorkplace(id);
      var item = document.createElement("span");
      item.className = "summary-item";
      item.textContent = (workplace ? workplace.name : "Deleted workplace") + " " + formatHours(totals.byWorkplace[id]) + " h";
      els.workplaceSummary.appendChild(item);
    });
  }

  function openShiftModal(shiftId) {
    var shift = shiftId ? state.shifts.find(function (item) { return item.id === shiftId; }) : null;
    renderWorkplaceSelect();
    els.shiftError.textContent = "";
    els.shiftId.value = shift ? shift.id : "";
    els.shiftModalTitle.textContent = shift ? "Edit Shift" : "Add Shift";
    els.deleteShiftBtn.classList.toggle("hidden", !shift);
    els.noWorkplaceNote.classList.toggle("hidden", state.workplaces.length > 0);
    els.saveShiftBtn.disabled = state.workplaces.length === 0;

    if (shift) {
      els.shiftWorkplace.value = shift.workplaceId;
      els.shiftDate.value = shift.date;
      els.shiftStart.value = shift.start;
      els.shiftEnd.value = shift.end;
    } else {
      els.shiftWorkplace.value = state.workplaces[0] ? state.workplaces[0].id : "";
      els.shiftDate.value = toISODate(selectedDate);
      els.shiftStart.value = "09:00";
      els.shiftEnd.value = "17:00";
    }

    openModal("shiftModal");
  }

  function saveShiftFromForm(event) {
    event.preventDefault();
    var id = els.shiftId.value;
    var start = els.shiftStart.value;
    var end = els.shiftEnd.value;

    if (!els.shiftWorkplace.value) {
      els.shiftError.textContent = "Please create a workplace first.";
      return;
    }

    if (timeToMinutes(end) <= timeToMinutes(start)) {
      els.shiftError.textContent = "End time must be after start time.";
      return;
    }

    var shift = {
      id: id || createId(),
      workplaceId: els.shiftWorkplace.value,
      date: els.shiftDate.value,
      start: start,
      end: end
    };

    if (id) {
      state.shifts = state.shifts.map(function (item) {
        return item.id === id ? shift : item;
      });
    } else {
      state.shifts.push(shift);
    }

    saveState();
    closeModal("shiftModal");
    selectedDate = parseISODate(shift.date);
    render();
  }

  function deleteCurrentShift() {
    var id = els.shiftId.value;
    if (!id) return;
    state.shifts = state.shifts.filter(function (shift) {
      return shift.id !== id;
    });
    saveState();
    closeModal("shiftModal");
    render();
  }

  function openWorkplaceModal() {
    resetWorkplaceForm();
    renderWorkplaces();
    openModal("workplaceModal");
  }

  function saveWorkplaceFromForm(event) {
    event.preventDefault();
    var id = els.workplaceId.value;
    var name = els.workplaceName.value.trim();
    var color = els.workplaceColor.value;
    els.workplaceError.textContent = "";

    if (!name) {
      els.workplaceError.textContent = "Workplace name is required.";
      return;
    }

    var duplicate = state.workplaces.some(function (workplace) {
      return workplace.name.toLowerCase() === name.toLowerCase() && workplace.id !== id;
    });
    if (duplicate) {
      els.workplaceError.textContent = "That workplace already exists.";
      return;
    }

    if (id) {
      state.workplaces = state.workplaces.map(function (workplace) {
        return workplace.id === id ? { id: id, name: name, color: color } : workplace;
      });
    } else {
      state.workplaces.push({ id: createId(), name: name, color: color });
    }

    saveState();
    resetWorkplaceForm();
    renderWorkplaces();
    render();
  }

  function renderWorkplaces() {
    els.workplaceList.innerHTML = "";

    if (state.workplaces.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "No workplaces yet.";
      els.workplaceList.appendChild(empty);
      return;
    }

    state.workplaces.forEach(function (workplace) {
      var row = document.createElement("div");
      row.className = "workplace-row";
      row.innerHTML =
        '<span class="swatch" style="background:' + escapeHTML(workplace.color) + '"></span>' +
        '<span class="workplace-name">' + escapeHTML(workplace.name) + '</span>' +
        '<button class="mini-btn" type="button">Edit</button>' +
        '<button class="mini-btn" type="button">Delete</button>';
      row.children[2].addEventListener("click", function () {
        els.workplaceId.value = workplace.id;
        els.workplaceName.value = workplace.name;
        els.workplaceColor.value = workplace.color;
        els.workplaceName.focus();
      });
      row.children[3].addEventListener("click", function () {
        deleteWorkplace(workplace.id);
      });
      els.workplaceList.appendChild(row);
    });
  }

  function deleteWorkplace(id) {
    state.workplaces = state.workplaces.filter(function (workplace) {
      return workplace.id !== id;
    });
    state.shifts = state.shifts.filter(function (shift) {
      return shift.workplaceId !== id;
    });
    saveState();
    resetWorkplaceForm();
    renderWorkplaces();
    render();
  }

  function resetWorkplaceForm() {
    els.workplaceId.value = "";
    els.workplaceName.value = "";
    els.workplaceColor.value = "#e60022";
    els.workplaceError.textContent = "";
  }

  function renderWorkplaceSelect() {
    els.shiftWorkplace.innerHTML = "";
    state.workplaces.forEach(function (workplace) {
      var option = document.createElement("option");
      option.value = workplace.id;
      option.textContent = workplace.name;
      els.shiftWorkplace.appendChild(option);
    });
  }

  function fillTimeOptions() {
    for (var minutes = 0; minutes <= 1440; minutes += 30) {
      els.shiftStart.add(new Option(formatTime(minutes), formatTime(minutes)));
      els.shiftEnd.add(new Option(formatTime(minutes), formatTime(minutes)));
    }
  }

  function movePeriod(direction) {
    if (activeView === "weekly") {
      selectedDate = addDays(selectedDate, direction * 7);
    } else if (activeView === "monthly") {
      selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1);
    } else {
      selectedDate = new Date(selectedDate.getFullYear() + direction, 0, 1);
    }
    render();
  }

  function getActiveRange() {
    if (activeView === "weekly") {
      var monday = startOfWeek(selectedDate);
      return { start: toISODate(monday), end: toISODate(addDays(monday, 6)) };
    }

    if (activeView === "monthly") {
      return getMonthRange(selectedDate.getFullYear(), selectedDate.getMonth());
    }

    return {
      start: selectedDate.getFullYear() + "-01-01",
      end: selectedDate.getFullYear() + "-12-31"
    };
  }

  function getMonthRange(year, month) {
    return {
      start: toISODate(new Date(year, month, 1)),
      end: toISODate(new Date(year, month + 1, 0))
    };
  }

  function getWeekDates() {
    var monday = startOfWeek(selectedDate);
    var dates = [];
    for (var index = 0; index < 7; index += 1) {
      dates.push(addDays(monday, index));
    }
    return dates;
  }

  function getShiftsForDate(dateString) {
    return state.shifts
      .filter(function (shift) { return shift.date === dateString; })
      .sort(function (a, b) { return timeToMinutes(a.start) - timeToMinutes(b.start); });
  }

  function getShiftsInRange(start, end) {
    return state.shifts.filter(function (shift) {
      return shift.date >= start && shift.date <= end;
    });
  }

  function getTotals(shifts) {
    var totals = { total: 0, byWorkplace: {} };
    shifts.forEach(function (shift) {
      var hours = (timeToMinutes(shift.end) - timeToMinutes(shift.start)) / 60;
      if (hours <= 0) return;
      totals.total += hours;
      totals.byWorkplace[shift.workplaceId] = (totals.byWorkplace[shift.workplaceId] || 0) + hours;
    });
    return totals;
  }

  function getWorkplace(id) {
    return state.workplaces.find(function (workplace) {
      return workplace.id === id;
    });
  }

  function openModal(id) {
    els[id].classList.remove("hidden");
  }

  function closeModal(id) {
    els[id].classList.add("hidden");
  }

  function minutesToPixels(minutes) {
    var boardHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--board-height"));
    return (minutes / 1440) * boardHeight;
  }

  function timeToMinutes(value) {
    if (value === "24:00") return 1440;
    var parts = value.split(":").map(Number);
    return parts[0] * 60 + parts[1];
  }

  function formatTime(minutes) {
    if (minutes === 1440) return "24:00";
    return pad(Math.floor(minutes / 60)) + ":" + pad(minutes % 60);
  }

  function formatHours(hours) {
    return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  }

  function startOfWeek(date) {
    var result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var day = result.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    return result;
  }

  function addDays(date, days) {
    var result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + days);
    return result;
  }

  function toISODate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function parseISODate(value) {
    var parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatRange(start, end) {
    var startText = String(start.getDate());
    var endText = end.getDate() + " " + end.toLocaleString("en", { month: "short" });
    if (start.getMonth() !== end.getMonth()) {
      startText += " " + start.toLocaleString("en", { month: "short" });
    }
    return startText + "-" + endText;
  }

  function isSameDate(a, b) {
    return toISODate(a) === toISODate(b);
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function loadState() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.workplaces) && Array.isArray(parsed.shifts)) {
        return parsed;
      }
    } catch (error) {
      return { workplaces: [], shifts: [] };
    }
    return { workplaces: [], shifts: [] };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
