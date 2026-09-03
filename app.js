(function () {
  "use strict";

  var STORAGE_KEY = "personalWeeklyRoster.v1";
  var dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  var majorTimes = [0, 360, 720, 1080, 1440];
  var state = loadState();
  var selectedMonday = startOfWeek(new Date());

  var els = {
    weekTitle: document.getElementById("weekTitle"),
    previousWeek: document.getElementById("previousWeek"),
    nextWeek: document.getElementById("nextWeek"),
    todayBtn: document.getElementById("todayBtn"),
    addShiftBtn: document.getElementById("addShiftBtn"),
    manageWorkplacesBtn: document.getElementById("manageWorkplacesBtn"),
    dayHeaderRow: document.getElementById("dayHeaderRow"),
    timeBoard: document.getElementById("timeBoard"),
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
    els.previousWeek.addEventListener("click", function () {
      selectedMonday = addDays(selectedMonday, -7);
      render();
    });

    els.nextWeek.addEventListener("click", function () {
      selectedMonday = addDays(selectedMonday, 7);
      render();
    });

    els.todayBtn.addEventListener("click", function () {
      selectedMonday = startOfWeek(new Date());
      render();
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
    renderWeekTitle();
    renderHeaders();
    renderBoard();
    renderSummary();
    renderWorkplaceSelect();
  }

  function renderWeekTitle() {
    var end = addDays(selectedMonday, 6);
    var text = formatRange(selectedMonday, end);
    els.weekTitle.textContent = isSameDate(selectedMonday, startOfWeek(new Date())) ? "This Week · " + text : text;
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

  function renderBoard() {
    var weekDates = getWeekDates();
    els.timeBoard.innerHTML = "";

    weekDates.forEach(function (date) {
      var column = document.createElement("div");
      column.className = "day-column";
      column.dataset.date = toISODate(date);

      majorTimes.forEach(function (minutes) {
        var label = document.createElement("div");
        label.className = "time-label";
        if (minutes === 0) label.classList.add("top");
        if (minutes === 1440) label.classList.add("bottom");
        label.style.top = minutesToPixels(minutes) + "px";
        label.textContent = formatTime(minutes);
        column.appendChild(label);
      });

      getShiftsForDate(toISODate(date)).forEach(function (shift) {
        column.appendChild(createShiftBlock(shift));
      });

      els.timeBoard.appendChild(column);
    });
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

  function renderSummary() {
    var weekStart = toISODate(selectedMonday);
    var weekEnd = toISODate(addDays(selectedMonday, 6));
    var totals = {};
    var total = 0;

    state.shifts.forEach(function (shift) {
      if (shift.date < weekStart || shift.date > weekEnd) return;
      var hours = (timeToMinutes(shift.end) - timeToMinutes(shift.start)) / 60;
      if (hours <= 0) return;
      total += hours;
      totals[shift.workplaceId] = (totals[shift.workplaceId] || 0) + hours;
    });

    els.totalHours.textContent = "Total: " + formatHours(total) + " h";
    els.workplaceSummary.innerHTML = "";

    Object.keys(totals).forEach(function (id) {
      var workplace = getWorkplace(id);
      var item = document.createElement("span");
      item.className = "summary-item";
      item.textContent = (workplace ? workplace.name : "Deleted workplace") + " " + formatHours(totals[id]) + " h";
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
      els.shiftDate.value = toISODate(new Date());
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
    selectedMonday = startOfWeek(parseISODate(shift.date));
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
      var optionStart = new Option(formatTime(minutes), formatTime(minutes));
      var optionEnd = new Option(formatTime(minutes), formatTime(minutes));
      els.shiftStart.add(optionStart);
      els.shiftEnd.add(optionEnd);
    }
  }

  function getWeekDates() {
    var dates = [];
    for (var index = 0; index < 7; index += 1) {
      dates.push(addDays(selectedMonday, index));
    }
    return dates;
  }

  function getShiftsForDate(dateString) {
    return state.shifts
      .filter(function (shift) { return shift.date === dateString; })
      .sort(function (a, b) { return timeToMinutes(a.start) - timeToMinutes(b.start); });
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
