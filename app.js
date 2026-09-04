(function () {
  "use strict";

  var STORAGE_KEY = "personalWeeklyRoster.v1";
  var UI_STORAGE_KEY = "personalWeeklyRoster.ui.v1";
  var dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var majorTimes = [0, 360, 720, 1080, 1440];
  var presetColors = [
    "#f40025",
    "#ff5a00",
    "#ff9f00",
    "#ffd60a",
    "#a8eb00",
    "#20c000",
    "#00b86b",
    "#12c7b7",
    "#0a9ff5",
    "#3155c9",
    "#8212c9",
    "#e0008a"
  ];
  var state = loadState();
  var activePage = loadActivePage();
  var activeView = loadActiveView();
  var selectedDate = new Date();
  var cloud = {
    enabled: false,
    ready: false,
    user: null,
    db: null,
    docRef: null,
    unsubscribe: null,
    isApplyingRemote: false,
    saveTimer: null,
    status: "Local only"
  };

  var els = {
    periodTitle: document.getElementById("periodTitle"),
    menuBtn: document.getElementById("menuBtn"),
    pageMenu: document.getElementById("pageMenu"),
    previousPeriod: document.getElementById("previousPeriod"),
    nextPeriod: document.getElementById("nextPeriod"),
    todayBtn: document.getElementById("todayBtn"),
    addShiftBtn: document.getElementById("addShiftBtn"),
    manageWorkplacesBtn: document.getElementById("manageWorkplacesBtn"),
    syncStatus: document.getElementById("syncStatus"),
    signInBtn: document.getElementById("signInBtn"),
    signOutBtn: document.getElementById("signOutBtn"),
    viewTabs: document.querySelectorAll(".view-tab"),
    weeklyView: document.getElementById("weeklyView"),
    monthlyView: document.getElementById("monthlyView"),
    yearlyView: document.getElementById("yearlyView"),
    dayHeaderRow: document.getElementById("dayHeaderRow"),
    timeAxis: document.getElementById("timeAxis"),
    timeBoard: document.getElementById("timeBoard"),
    monthGrid: document.getElementById("monthGrid"),
    yearGrid: document.getElementById("yearGrid"),
    earningsView: document.getElementById("earningsView"),
    earningsPeriodLabel: document.getElementById("earningsPeriodLabel"),
    earningsHours: document.getElementById("earningsHours"),
    earningsPay: document.getElementById("earningsPay"),
    earningsBreakdown: document.getElementById("earningsBreakdown"),
    editPayRatesBtn: document.getElementById("editPayRatesBtn"),
    holidayForm: document.getElementById("holidayForm"),
    holidayDate: document.getElementById("holidayDate"),
    holidayNote: document.getElementById("holidayNote"),
    holidayList: document.getElementById("holidayList"),
    summaryBar: document.getElementById("summaryBar"),
    totalHours: document.getElementById("totalHours"),
    workplaceSummary: document.getElementById("workplaceSummary"),
    shiftModal: document.getElementById("shiftModal"),
    shiftForm: document.getElementById("shiftForm"),
    shiftModalTitle: document.getElementById("shiftModalTitle"),
    shiftId: document.getElementById("shiftId"),
    shiftWorkplace: document.getElementById("shiftWorkplace"),
    shiftDate: document.getElementById("shiftDate"),
    shiftStart: document.getElementById("shiftStart"),
    shiftStartHour: document.getElementById("shiftStartHour"),
    shiftStartMinute: document.getElementById("shiftStartMinute"),
    shiftEnd: document.getElementById("shiftEnd"),
    shiftEndHour: document.getElementById("shiftEndHour"),
    shiftEndMinute: document.getElementById("shiftEndMinute"),
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
    workplaceBaseRate: document.getElementById("workplaceBaseRate"),
    weekdayBaseRate: document.getElementById("weekdayBaseRate"),
    weekdayEarlyEnd: document.getElementById("weekdayEarlyEnd"),
    weekdayEarlyRate: document.getElementById("weekdayEarlyRate"),
    weekdayEveningStart: document.getElementById("weekdayEveningStart"),
    weekdayEveningRate: document.getElementById("weekdayEveningRate"),
    saturdayBaseRate: document.getElementById("saturdayBaseRate"),
    saturdayEarlyEnd: document.getElementById("saturdayEarlyEnd"),
    saturdayEarlyRate: document.getElementById("saturdayEarlyRate"),
    saturdayEveningStart: document.getElementById("saturdayEveningStart"),
    saturdayEveningRate: document.getElementById("saturdayEveningRate"),
    sundayEarlyEnd: document.getElementById("sundayEarlyEnd"),
    sundayEarlyRate: document.getElementById("sundayEarlyRate"),
    sundayBaseRate: document.getElementById("sundayBaseRate"),
    sundayEveningStart: document.getElementById("sundayEveningStart"),
    sundayEveningRate: document.getElementById("sundayEveningRate"),
    publicHolidayEarlyEnd: document.getElementById("publicHolidayEarlyEnd"),
    publicHolidayEarlyRate: document.getElementById("publicHolidayEarlyRate"),
    publicHolidayBaseRate: document.getElementById("publicHolidayBaseRate"),
    publicHolidayEveningStart: document.getElementById("publicHolidayEveningStart"),
    publicHolidayEveningRate: document.getElementById("publicHolidayEveningRate"),
    colorPresets: document.getElementById("colorPresets"),
    workplaceError: document.getElementById("workplaceError"),
    workplaceList: document.getElementById("workplaceList"),
    cancelWorkplaceEdit: document.getElementById("cancelWorkplaceEdit"),
    previewModal: document.getElementById("previewModal"),
    previewModalTitle: document.getElementById("previewModalTitle"),
    previewList: document.getElementById("previewList"),
    authModal: document.getElementById("authModal"),
    authForm: document.getElementById("authForm"),
    authEmail: document.getElementById("authEmail"),
    authPassword: document.getElementById("authPassword"),
    authError: document.getElementById("authError"),
    authMessage: document.getElementById("authMessage"),
    resetPasswordBtn: document.getElementById("resetPasswordBtn"),
    createAccountBtn: document.getElementById("createAccountBtn")
  };

  init();

  function init() {
    renderTimeControls();
    renderColorPresets();
    bindEvents();
    bindPayTimeSteppers();
    bindFinalRatePreviews();
    initFirebase();
    render();
  }

  function bindEvents() {
    els.menuBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      els.pageMenu.classList.toggle("hidden");
    });

    els.pageMenu.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        activePage = button.dataset.page;
        saveActivePage();
        els.pageMenu.classList.add("hidden");
        render();
      });
    });

    document.addEventListener("click", function () {
      els.pageMenu.classList.add("hidden");
    });

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

    window.addEventListener("resize", function () {
      if (activeView === "weekly") renderWeekly();
    });

    els.viewTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeView = tab.dataset.view;
        saveActiveView();
        render();
      });
    });

    els.addShiftBtn.addEventListener("click", function () {
      openShiftModal();
    });

    els.signInBtn.addEventListener("click", function () {
      clearAuthFeedback();
      if (!cloud.enabled) {
        els.authError.textContent = "Online sync is not ready yet. Please try again later.";
      }
      openModal("authModal");
    });

    els.signOutBtn.addEventListener("click", signOut);
    els.authForm.addEventListener("submit", signIn);
    els.createAccountBtn.addEventListener("click", createAccount);
    els.resetPasswordBtn.addEventListener("click", resetPassword);

    els.manageWorkplacesBtn.addEventListener("click", function () {
      openWorkplaceModal();
    });

    els.editPayRatesBtn.addEventListener("click", function () {
      openWorkplaceModal();
    });

    els.holidayForm.addEventListener("submit", saveHolidayFromForm);

    els.openWorkplacesFromShift.addEventListener("click", function () {
      closeModal("shiftModal");
      openWorkplaceModal();
    });

    els.shiftForm.addEventListener("submit", saveShiftFromForm);
    els.deleteShiftBtn.addEventListener("click", deleteCurrentShift);
    els.workplaceForm.addEventListener("submit", saveWorkplaceFromForm);
    els.cancelWorkplaceEdit.addEventListener("click", resetWorkplaceForm);
    els.workplaceColor.addEventListener("input", renderColorPresetSelection);
    [els.shiftStartHour, els.shiftStartMinute, els.shiftEndHour, els.shiftEndMinute].forEach(function (select) {
      select.addEventListener("change", syncTimeFields);
    });

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
    renderPageMenu();
    renderViewTabs();
    renderTitle();
    renderSummary();
    renderSyncUI();
    renderWorkplaceSelect();
    var showingRoster = activePage === "roster";
    els.summaryBar.classList.toggle("hidden", !showingRoster);
    els.weeklyView.classList.toggle("hidden", !showingRoster || activeView !== "weekly");
    els.monthlyView.classList.toggle("hidden", !showingRoster || activeView !== "monthly");
    els.yearlyView.classList.toggle("hidden", !showingRoster || activeView !== "yearly");
    els.earningsView.classList.toggle("hidden", activePage !== "earnings");

    if (showingRoster && activeView === "weekly") renderWeekly();
    if (showingRoster && activeView === "monthly") renderMonthly();
    if (showingRoster && activeView === "yearly") renderYearly();
    if (activePage === "earnings") renderEarnings();
  }

  function renderPageMenu() {
    els.pageMenu.querySelectorAll("button").forEach(function (button) {
      button.classList.toggle("active", button.dataset.page === activePage);
    });
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
    fitWeeklyBoard();
    renderTimeAxis();
    renderBoard();
  }

  function fitWeeklyBoard() {
    var boardTop = els.weeklyView.getBoundingClientRect().top + getHeaderHeight();
    var available = Math.max(window.innerHeight - boardTop - 4, 320);
    document.documentElement.style.setProperty("--board-height", available + "px");
  }

  function renderHeaders() {
    els.dayHeaderRow.innerHTML = "";
    getWeekDates().forEach(function (date, index) {
      var head = document.createElement("div");
      head.className = "day-head";
      if (isSameDate(date, new Date())) head.classList.add("today");
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
      if (isSameDate(date, new Date())) cell.classList.add("today");
      cell.innerHTML = '<div class="month-date">' + date.getDate() + '</div>';
      cell.addEventListener("click", function (targetDate) {
        return function () {
          openDayPreview(targetDate);
        };
      }(dateString));

      getShiftsForDate(dateString).slice(0, 3).forEach(function (shift) {
        cell.appendChild(createMiniShift(shift, dateString));
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
      }

      day.addEventListener("click", function (targetDate) {
        return function () {
          openDayPreview(targetDate);
        };
      }(dateString));

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

  function createMiniShift(shift, dateString) {
    var workplace = getWorkplace(shift.workplaceId);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mini-shift";
    button.style.backgroundColor = workplace ? workplace.color : "#7a7f86";
    button.textContent = shift.start + "-" + shift.end + " " + (workplace ? workplace.name : "Shift");
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      openDayPreview(dateString);
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

  function renderSyncUI() {
    els.syncStatus.textContent = cloud.status;
    els.signInBtn.classList.toggle("hidden", !!cloud.user);
    els.signOutBtn.classList.toggle("hidden", !cloud.user);
  }

  function renderEarnings() {
    var range = getActiveRange();
    var shifts = getShiftsInRange(range.start, range.end);
    var earnings = getEarningsTotals(shifts);
    var label = activeView === "weekly" ? "This Week" : activeView === "monthly" ? selectedDate.toLocaleString("en", { month: "long" }) + " estimated gross pay" : "Yearly Earnings";

    els.earningsPeriodLabel.textContent = activeView === "yearly" ? label + " " + selectedDate.getFullYear() : label;
    els.earningsHours.textContent = formatHours(earnings.hours) + " hours";
    els.earningsPay.textContent = "Estimated gross pay: " + formatCurrency(earnings.pay);
    els.earningsBreakdown.innerHTML = "";

    if (Object.keys(earnings.byWorkplace).length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "No shifts in this period.";
      els.earningsBreakdown.appendChild(empty);
    } else {
      Object.keys(earnings.byWorkplace).forEach(function (id) {
        var workplace = getWorkplace(id);
        var item = earnings.byWorkplace[id];
        var row = document.createElement("div");
        row.className = "earning-card";
        row.innerHTML =
          '<div class="earning-total">' +
            '<span class="swatch" style="background:' + escapeHTML(workplace ? workplace.color : "#7a7f86") + '"></span>' +
            '<strong>' + escapeHTML(workplace ? workplace.name : "Deleted workplace") + '</strong>' +
            '<span>' + escapeHTML(formatHours(item.hours)) + ' h</span>' +
            '<b>' + escapeHTML(formatCurrency(item.pay)) + '</b>' +
          '</div>' +
          '<div class="pay-detail-title">Hours &amp; Earnings</div>' +
          '<div class="pay-detail-head"><span>Description</span><span>Hours</span><span>Rate</span><span>Begin</span><span>End</span><span>Earnings</span></div>' +
          renderPayDetailRows(item.details, range);
        els.earningsBreakdown.appendChild(row);
      });
    }

    renderHolidayList();
  }

  function renderPayDetailRows(details, range) {
    var begin = formatPayslipDate(parseISODate(range.start));
    var end = formatPayslipDate(parseISODate(range.end));
    return Object.keys(details).map(function (key) {
      return details[key];
    }).sort(function (a, b) {
      return a.multiplier - b.multiplier;
    }).map(function (detail) {
      return (
        '<div class="pay-detail-row">' +
          '<span>' + escapeHTML(detail.description) + '</span>' +
          '<span>' + escapeHTML(formatHours(detail.hours)) + ' h</span>' +
          '<span>' + escapeHTML(formatCurrency(detail.rate)) + '/hr</span>' +
          '<span>' + escapeHTML(begin) + '</span>' +
          '<span>' + escapeHTML(end) + '</span>' +
          '<b>' + escapeHTML(formatCurrency(detail.pay)) + '</b>' +
        '</div>'
      );
    }).join("");
  }

  function getPayDetailDescription(multiplier) {
    return multiplier === 1 ? "Ordinary 1.0" : "Penalty " + formatMultiplier(multiplier);
  }

  function initFirebase() {
    var config = window.MY_ROSTER_FIREBASE_CONFIG;
    if (!isFirebaseConfigured(config) || !window.firebase) {
      cloud.status = "Local only";
      renderSyncUI();
      return;
    }

    try {
      window.firebase.initializeApp(config);
      cloud.enabled = true;
      cloud.db = window.firebase.firestore();
      cloud.status = "Not signed in";
      window.firebase.auth().onAuthStateChanged(handleAuthChange);
    } catch (error) {
      cloud.status = "Sync setup error";
      renderSyncUI();
    }
  }

  function isFirebaseConfigured(config) {
    return !!(
      config &&
      config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.appId
    );
  }

  function handleAuthChange(user) {
    cloud.user = user || null;

    if (cloud.unsubscribe) {
      cloud.unsubscribe();
      cloud.unsubscribe = null;
    }

    if (!user) {
      cloud.docRef = null;
      cloud.status = cloud.enabled ? "Not signed in" : "Local only";
      renderSyncUI();
      return;
    }

    cloud.status = "Syncing...";
    renderSyncUI();
    cloud.docRef = cloud.db.collection("users").doc(user.uid).collection("rosters").doc("default");
    cloud.unsubscribe = cloud.docRef.onSnapshot(function (snapshot) {
      if (snapshot.exists) {
        var data = snapshot.data();
        if (Array.isArray(data.workplaces) && Array.isArray(data.shifts)) {
          cloud.isApplyingRemote = true;
          state = normalizeState(data);
          saveLocalState();
          cloud.isApplyingRemote = false;
          cloud.status = "Synced";
          render();
        }
      } else {
        saveCloudStateNow();
      }
    }, function () {
      cloud.status = "Sync error";
      renderSyncUI();
    });
  }

  function signIn(event) {
    event.preventDefault();
    if (!cloud.enabled) {
      els.authError.textContent = "Online sync is not ready yet. Please try again later.";
      return;
    }

    clearAuthFeedback();
    window.firebase.auth()
      .signInWithEmailAndPassword(els.authEmail.value.trim(), els.authPassword.value)
      .then(function () {
        closeModal("authModal");
        els.authForm.reset();
      })
      .catch(function (error) {
        els.authError.textContent = readableAuthError(error);
      });
  }

  function createAccount() {
    if (!cloud.enabled) {
      els.authError.textContent = "Online sync is not ready yet. Please try again later.";
      return;
    }

    clearAuthFeedback();
    window.firebase.auth()
      .createUserWithEmailAndPassword(els.authEmail.value.trim(), els.authPassword.value)
      .then(function () {
        closeModal("authModal");
        els.authForm.reset();
      })
      .catch(function (error) {
        els.authError.textContent = readableAuthError(error);
      });
  }

  function resetPassword() {
    if (!cloud.enabled) {
      els.authError.textContent = "Online sync is not ready yet. Please try again later.";
      return;
    }

    clearAuthFeedback();
    var email = els.authEmail.value.trim();
    if (!email) {
      els.authError.textContent = "Enter your email first, then tap Forgot password.";
      els.authEmail.focus();
      return;
    }

    els.resetPasswordBtn.disabled = true;
    window.firebase.auth()
      .sendPasswordResetEmail(email)
      .then(function () {
        els.authMessage.textContent = "Password reset email sent. Please check your inbox.";
      })
      .catch(function (error) {
        els.authError.textContent = readableAuthError(error);
      })
      .finally(function () {
        els.resetPasswordBtn.disabled = false;
      });
  }

  function signOut() {
    if (!cloud.enabled) return;
    window.firebase.auth().signOut();
  }

  function clearAuthFeedback() {
    els.authError.textContent = "";
    els.authMessage.textContent = "";
  }

  function readableAuthError(error) {
    if (!error || !error.code) return "Could not sign in.";
    if (error.code === "auth/email-already-in-use") return "That email already has an account.";
    if (error.code === "auth/invalid-email") return "Enter a valid email address.";
    if (error.code === "auth/invalid-credential" || error.code === "auth/invalid-login-credentials" || error.code === "auth/wrong-password") return "Password is incorrect, or this account does not exist. Please try again or reset your password.";
    if (error.code === "auth/user-not-found") return "No account found with this email. Please create an account first.";
    if (error.code === "auth/too-many-requests") return "Too many attempts. Please wait a moment or reset your password.";
    if (error.code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (error.code === "auth/network-request-failed") return "Network error. Please check your connection and try again.";
    return error.message || "Could not sign in.";
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
      setTimeControls("shiftStart", shift.start);
      setTimeControls("shiftEnd", shift.end);
    } else {
      els.shiftWorkplace.value = state.workplaces[0] ? state.workplaces[0].id : "";
      els.shiftDate.value = toISODate(selectedDate);
      setTimeControls("shiftStart", "09:00");
      setTimeControls("shiftEnd", "17:00");
    }

    openModal("shiftModal");
  }

  function saveShiftFromForm(event) {
    event.preventDefault();
    syncTimeFields();
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

  function openDayPreview(dateString) {
    var date = parseISODate(dateString);
    var shifts = getShiftsForDate(dateString);
    els.previewModalTitle.textContent = date.getDate() + " " + date.toLocaleString("en", { month: "short", year: "numeric" });
    els.previewList.innerHTML = "";

    if (shifts.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "No shifts on this day.";
      els.previewList.appendChild(empty);
    }

    shifts.forEach(function (shift) {
      var workplace = getWorkplace(shift.workplaceId);
      var row = document.createElement("div");
      row.className = "preview-shift";
      row.innerHTML =
        '<span class="preview-color" style="background:' + escapeHTML(workplace ? workplace.color : "#7a7f86") + '"></span>' +
        '<span class="preview-main">' +
          '<strong>' + escapeHTML(shift.start + "-" + shift.end) + '</strong>' +
          '<span>' + escapeHTML(workplace ? workplace.name : "Deleted workplace") + '</span>' +
        '</span>' +
        '<span class="preview-hours">' + escapeHTML(formatHours((timeToMinutes(shift.end) - timeToMinutes(shift.start)) / 60)) + ' h</span>';
      els.previewList.appendChild(row);
    });

    openModal("previewModal");
  }

  function renderTimeControls() {
    fillHourSelect(els.shiftStartHour, 23);
    fillHourSelect(els.shiftEndHour, 24);
    fillMinuteSelect(els.shiftStartMinute);
    fillMinuteSelect(els.shiftEndMinute);
  }

  function fillHourSelect(select, maxHour) {
    select.innerHTML = "";
    for (var hour = 0; hour <= maxHour; hour += 1) {
      var option = document.createElement("option");
      option.value = pad(hour);
      option.textContent = pad(hour);
      select.appendChild(option);
    }
  }

  function fillMinuteSelect(select) {
    select.innerHTML = "";
    for (var minute = 0; minute < 60; minute += 5) {
      var option = document.createElement("option");
      option.value = pad(minute);
      option.textContent = pad(minute);
      select.appendChild(option);
    }
  }

  function setTimeControls(prefix, value) {
    var parts = value.split(":");
    els[prefix + "Hour"].value = parts[0];
    els[prefix + "Minute"].value = parts[1];
    syncTimeFields();
  }

  function syncTimeFields() {
    syncTimeField("shiftStart");
    syncTimeField("shiftEnd");
  }

  function syncTimeField(prefix) {
    var hour = els[prefix + "Hour"].value;
    var minute = els[prefix + "Minute"].value;
    if (hour === "24") {
      minute = "00";
      els[prefix + "Minute"].value = minute;
      els[prefix + "Minute"].disabled = true;
    } else {
      els[prefix + "Minute"].disabled = false;
    }
    els[prefix].value = hour + ":" + minute;
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
    var pay = readPaySettingsFromForm();
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

    var payError = validatePaySettings(pay);
    if (payError) {
      els.workplaceError.textContent = payError;
      return;
    }

    if (id) {
      state.workplaces = state.workplaces.map(function (workplace) {
        return workplace.id === id ? Object.assign({}, workplace, { id: id, name: name, color: color, pay: pay }) : workplace;
      });
    } else {
      state.workplaces.push({ id: createId(), name: name, color: color, pay: pay });
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
      var pay = getPaySettings(workplace);
      row.innerHTML =
        '<span class="swatch" style="background:' + escapeHTML(workplace.color) + '"></span>' +
        '<span class="workplace-name">' + escapeHTML(workplace.name) + '<small>' + escapeHTML(formatCurrency(pay.baseRate)) + '/hr</small></span>' +
        '<button class="mini-btn" type="button">Edit</button>' +
        '<button class="mini-btn" type="button">Delete</button>';
      row.children[2].addEventListener("click", function () {
        els.workplaceId.value = workplace.id;
        els.workplaceName.value = workplace.name;
        els.workplaceColor.value = workplace.color;
        setPaySettingsForm(workplace);
        renderColorPresetSelection();
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
    els.workplaceColor.value = presetColors[0];
    setPaySettingsForm();
    els.workplaceError.textContent = "";
    renderColorPresetSelection();
  }

  function readPaySettingsFromForm() {
    syncAllPayTimeSteppersToHidden();
    return {
      baseRate: readNumberInput(els.workplaceBaseRate, 0),
      boundaries: {
        weekdayEarlyEnd: readTimeInput(els.weekdayEarlyEnd, "06:00"),
        weekdayEveningStart: readTimeInput(els.weekdayEveningStart, "18:00"),
        saturdayEarlyEnd: readTimeInput(els.saturdayEarlyEnd, "06:00"),
        saturdayEveningStart: readTimeInput(els.saturdayEveningStart, "18:00"),
        sundayEarlyEnd: readTimeInput(els.sundayEarlyEnd, "06:00"),
        sundayEveningStart: readTimeInput(els.sundayEveningStart, "18:00"),
        publicHolidayEarlyEnd: readTimeInput(els.publicHolidayEarlyEnd, "06:00"),
        publicHolidayEveningStart: readTimeInput(els.publicHolidayEveningStart, "18:00")
      },
      rates: {
        weekdayBase: readNumberInput(els.weekdayBaseRate, 1),
        weekdayEarly: readNumberInput(els.weekdayEarlyRate, 1),
        weekdayEvening: readNumberInput(els.weekdayEveningRate, 1),
        saturdayBase: readNumberInput(els.saturdayBaseRate, 1),
        saturdayEarly: readNumberInput(els.saturdayEarlyRate, 1),
        saturdayEvening: readNumberInput(els.saturdayEveningRate, 1),
        sundayBase: readNumberInput(els.sundayBaseRate, 1),
        sundayEarly: readNumberInput(els.sundayEarlyRate, 1),
        sundayEvening: readNumberInput(els.sundayEveningRate, 1),
        publicHolidayBase: readNumberInput(els.publicHolidayBaseRate, 1),
        publicHolidayEarly: readNumberInput(els.publicHolidayEarlyRate, 1),
        publicHolidayEvening: readNumberInput(els.publicHolidayEveningRate, 1)
      }
    };
  }

  function setPaySettingsForm(workplace) {
    var pay = getPaySettings(workplace || {});
    els.workplaceBaseRate.value = pay.baseRate ? String(pay.baseRate) : "";
    setPayBoundaryValue(els.weekdayEarlyEnd, pay.boundaries.weekdayEarlyEnd);
    setPayBoundaryValue(els.weekdayEveningStart, pay.boundaries.weekdayEveningStart);
    setPayBoundaryValue(els.saturdayEarlyEnd, pay.boundaries.saturdayEarlyEnd);
    setPayBoundaryValue(els.saturdayEveningStart, pay.boundaries.saturdayEveningStart);
    setPayBoundaryValue(els.sundayEarlyEnd, pay.boundaries.sundayEarlyEnd);
    setPayBoundaryValue(els.sundayEveningStart, pay.boundaries.sundayEveningStart);
    setPayBoundaryValue(els.publicHolidayEarlyEnd, pay.boundaries.publicHolidayEarlyEnd);
    setPayBoundaryValue(els.publicHolidayEveningStart, pay.boundaries.publicHolidayEveningStart);
    els.weekdayBaseRate.value = String(pay.rates.weekdayBase);
    els.weekdayEarlyRate.value = String(pay.rates.weekdayEarly);
    els.weekdayEveningRate.value = String(pay.rates.weekdayEvening);
    els.saturdayBaseRate.value = String(pay.rates.saturdayBase);
    els.saturdayEarlyRate.value = String(pay.rates.saturdayEarly);
    els.saturdayEveningRate.value = String(pay.rates.saturdayEvening);
    els.sundayBaseRate.value = String(pay.rates.sundayBase);
    els.sundayEarlyRate.value = String(pay.rates.sundayEarly);
    els.sundayEveningRate.value = String(pay.rates.sundayEvening);
    els.publicHolidayBaseRate.value = String(pay.rates.publicHolidayBase);
    els.publicHolidayEarlyRate.value = String(pay.rates.publicHolidayEarly);
    els.publicHolidayEveningRate.value = String(pay.rates.publicHolidayEvening);
    renderFinalHourlyRates();
  }

  function bindFinalRatePreviews() {
    var inputs = [els.workplaceBaseRate].concat(Array.prototype.slice.call(document.querySelectorAll("[data-final-rate-source]")).map(function (output) {
      return document.getElementById(output.dataset.finalRateSource);
    }).filter(Boolean));

    inputs.forEach(function (input) {
      input.addEventListener("input", renderFinalHourlyRates);
      input.addEventListener("change", renderFinalHourlyRates);
    });

    renderFinalHourlyRates();
  }

  function renderFinalHourlyRates() {
    var baseRate = readNumberInput(els.workplaceBaseRate, 0);
    document.querySelectorAll("[data-final-rate-source]").forEach(function (output) {
      var source = document.getElementById(output.dataset.finalRateSource);
      var multiplier = source ? readNumberInput(source, 0) : 0;
      output.textContent = formatCurrency(baseRate * multiplier) + "/hr";
    });
  }

  function bindPayTimeSteppers() {
    document.querySelectorAll(".time-stepper").forEach(function (control) {
      control.querySelectorAll("input").forEach(function (input) {
        input.addEventListener("input", function () {
          syncPayTimeStepperToHidden(control, false);
        });
        input.addEventListener("change", function () {
          syncPayTimeStepperToHidden(control, true);
        });
        input.addEventListener("blur", function () {
          syncPayTimeStepperToHidden(control, true);
        });
      });
      renderPayTimeStepper(control.dataset.timeControl);
    });
  }

  function setPayBoundaryValue(input, value) {
    input.value = normalizeTimeValue(value) || "00:00";
    renderPayTimeStepper(input.id);
  }

  function renderPayTimeStepper(targetId) {
    var control = document.querySelector('[data-time-control="' + targetId + '"]');
    var input = document.getElementById(targetId);
    if (!control || !input) return;

    var time = normalizeTimeValue(input.value) || "00:00";
    var parts = time.split(":");
    var hourInput = control.querySelector(".time-hour");
    var minuteInput = control.querySelector(".time-minute");
    if (hourInput) hourInput.value = parts[0];
    if (minuteInput) minuteInput.value = parts[1];
  }

  function syncAllPayTimeSteppersToHidden() {
    document.querySelectorAll(".time-stepper").forEach(function (control) {
      syncPayTimeStepperToHidden(control, true);
    });
  }

  function syncPayTimeStepperToHidden(control, shouldClamp) {
    var target = document.getElementById(control.dataset.timeControl);
    var hourInput = control.querySelector(".time-hour");
    var minuteInput = control.querySelector(".time-minute");
    if (!target || !hourInput || !minuteInput) return;

    var hourText = hourInput.value.trim();
    var minuteText = minuteInput.value.trim();
    var hour = Number(hourText);
    var minute = Number(minuteText);
    if (shouldClamp) {
      hour = clampInteger(hour, 0, 23);
      minute = clampInteger(minute, 0, 59);
      hourInput.value = pad(hour);
      minuteInput.value = pad(minute);
    } else if (!hourText || !minuteText || !Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return;
    }

    target.value = pad(hour) + ":" + pad(minute);
  }

  function clampInteger(value, min, max) {
    var number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(Math.max(Math.round(number), min), max);
  }

  function readNumberInput(input, fallback) {
    var value = Number(input.value);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  function readTimeInput(input, fallback) {
    return normalizeTimeValue(input.value) || fallback;
  }

  function validatePaySettings(pay) {
    if (timeToMinutes(pay.boundaries.weekdayEarlyEnd) > timeToMinutes(pay.boundaries.weekdayEveningStart)) {
      return "Weekday before time must be earlier than after time.";
    }

    if (timeToMinutes(pay.boundaries.saturdayEarlyEnd) > timeToMinutes(pay.boundaries.saturdayEveningStart)) {
      return "Saturday before time must be earlier than after time.";
    }

    if (timeToMinutes(pay.boundaries.sundayEarlyEnd) > timeToMinutes(pay.boundaries.sundayEveningStart)) {
      return "Sunday before time must be earlier than after time.";
    }

    if (timeToMinutes(pay.boundaries.publicHolidayEarlyEnd) > timeToMinutes(pay.boundaries.publicHolidayEveningStart)) {
      return "Public holiday before time must be earlier than after time.";
    }

    return "";
  }

  function renderColorPresets() {
    els.colorPresets.innerHTML = "";
    presetColors.forEach(function (color) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "color-preset";
      button.style.backgroundColor = color;
      button.setAttribute("aria-label", "Use color " + color);
      button.dataset.color = color;
      button.addEventListener("click", function () {
        els.workplaceColor.value = color;
        renderColorPresetSelection();
      });
      els.colorPresets.appendChild(button);
    });
    renderColorPresetSelection();
  }

  function renderColorPresetSelection() {
    els.colorPresets.querySelectorAll(".color-preset").forEach(function (button) {
      button.classList.toggle("selected", button.dataset.color.toLowerCase() === els.workplaceColor.value.toLowerCase());
    });
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

  function saveHolidayFromForm(event) {
    event.preventDefault();
    var date = els.holidayDate.value;
    var note = els.holidayNote.value.trim();
    if (!date) return;
    var existing = state.publicHolidays.find(function (holiday) {
      return holiday.date === date;
    });
    if (existing) {
      existing.note = note;
    } else {
      state.publicHolidays.push({ date: date, note: note });
    }
    sortPublicHolidays();
    saveState();
    els.holidayDate.value = "";
    els.holidayNote.value = "";
    render();
  }

  function renderHolidayList() {
    els.holidayList.innerHTML = "";

    if (state.publicHolidays.length === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "No public holidays added.";
      els.holidayList.appendChild(empty);
      return;
    }

    state.publicHolidays.forEach(function (holiday) {
      var row = document.createElement("div");
      row.className = "holiday-row";
      row.innerHTML =
        '<div class="holiday-main">' +
          '<strong>' + escapeHTML(formatDisplayDate(parseISODate(holiday.date))) + '</strong>' +
          '<input type="text" maxlength="48" value="' + escapeHTML(holiday.note || "") + '" placeholder="Add note" aria-label="Note for ' + escapeHTML(formatDisplayDate(parseISODate(holiday.date))) + '" />' +
        '</div>' +
        '<button class="mini-btn" type="button">Delete</button>';
      row.querySelector("input").addEventListener("input", function (event) {
        holiday.note = event.target.value.trim();
        saveState();
      });
      row.querySelector("button").addEventListener("click", function () {
        state.publicHolidays = state.publicHolidays.filter(function (item) {
          return item.date !== holiday.date;
        });
        saveState();
        render();
      });
      els.holidayList.appendChild(row);
    });
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

  function getEarningsTotals(shifts) {
    var totals = { hours: 0, pay: 0, byWorkplace: {} };
    shifts.forEach(function (shift) {
      var workplace = getWorkplace(shift.workplaceId);
      var paySettings = getPaySettings(workplace || {});
      getPaySegmentsForShift(shift, paySettings).forEach(function (segment) {
        var hours = segment.minutes / 60;
        var pay = hours * paySettings.baseRate * segment.multiplier;
        var detailKey = String(segment.multiplier);
        totals.hours += hours;
        totals.pay += pay;

        if (!totals.byWorkplace[shift.workplaceId]) {
          totals.byWorkplace[shift.workplaceId] = { hours: 0, pay: 0, details: {} };
        }
        totals.byWorkplace[shift.workplaceId].hours += hours;
        totals.byWorkplace[shift.workplaceId].pay += pay;

        if (!totals.byWorkplace[shift.workplaceId].details[detailKey]) {
          totals.byWorkplace[shift.workplaceId].details[detailKey] = {
            multiplier: segment.multiplier,
            description: getPayDetailDescription(segment.multiplier),
            hours: 0,
            rate: paySettings.baseRate * segment.multiplier,
            pay: 0
          };
        }
        totals.byWorkplace[shift.workplaceId].details[detailKey].hours += hours;
        totals.byWorkplace[shift.workplaceId].details[detailKey].pay += pay;
      });
    });
    return totals;
  }

  function getPaySettings(workplace) {
    var pay = workplace && workplace.pay ? workplace.pay : {};
    var rates = pay.rates || {};
    var boundaries = pay.boundaries || {};
    var weekday = numberOrDefault(rates.weekday, 1);
    var saturday = numberOrDefault(rates.saturday, 1);
    var sunday = numberOrDefault(rates.sunday, 1);
    return {
      baseRate: Number(pay.baseRate) || 0,
      boundaries: {
        weekdayEarlyEnd: validTimeOrDefault(boundaries.weekdayEarlyEnd, "06:00"),
        weekdayEveningStart: validTimeOrDefault(boundaries.weekdayEveningStart, "18:00"),
        saturdayEarlyEnd: validTimeOrDefault(boundaries.saturdayEarlyEnd, "06:00"),
        saturdayEveningStart: validTimeOrDefault(boundaries.saturdayEveningStart, "18:00"),
        sundayEarlyEnd: validTimeOrDefault(boundaries.sundayEarlyEnd || boundaries.sundaySplitTime, "06:00"),
        sundayEveningStart: validTimeOrDefault(boundaries.sundayEveningStart || boundaries.sundaySplitTime, "18:00"),
        publicHolidayEarlyEnd: validTimeOrDefault(boundaries.publicHolidayEarlyEnd, "06:00"),
        publicHolidayEveningStart: validTimeOrDefault(boundaries.publicHolidayEveningStart, "18:00")
      },
      rates: {
        weekdayBase: numberOrDefault(rates.weekdayBase, weekday),
        weekdayEarly: numberOrDefault(rates.weekdayEarly, weekday),
        weekdayEvening: numberOrDefault(rates.weekdayEvening, weekday),
        saturdayBase: numberOrDefault(rates.saturdayBase, saturday),
        saturdayEarly: numberOrDefault(rates.saturdayEarly, saturday),
        saturdayEvening: numberOrDefault(rates.saturdayEvening, saturday),
        sundayBase: numberOrDefault(rates.sundayBase, sunday),
        sundayEarly: numberOrDefault(rates.sundayEarly, numberOrDefault(rates.sundayBefore9, sunday)),
        sundayEvening: numberOrDefault(rates.sundayEvening, numberOrDefault(rates.sundayAfter9, sunday)),
        publicHolidayBase: numberOrDefault(rates.publicHolidayBase, numberOrDefault(rates.publicHoliday, 1)),
        publicHolidayEarly: numberOrDefault(rates.publicHolidayEarly, numberOrDefault(rates.publicHoliday, 1)),
        publicHolidayEvening: numberOrDefault(rates.publicHolidayEvening, numberOrDefault(rates.publicHoliday, 1))
      }
    };
  }

  function getPaySegmentsForShift(shift, paySettings) {
    var start = timeToMinutes(shift.start);
    var end = timeToMinutes(shift.end);
    if (end <= start) return [];
    if (isPublicHoliday(shift.date)) {
      return splitShiftByRules(start, end, getPublicHolidayPayRules(paySettings));
    }

    var day = parseISODate(shift.date).getDay();
    var rules = getPayRulesForDay(day, paySettings);
    return splitShiftByRules(start, end, rules);
  }

  function getPayRulesForDay(day, paySettings) {
    if (day === 6) {
      var saturdayEarlyEnd = timeToMinutes(paySettings.boundaries.saturdayEarlyEnd);
      var saturdayEveningStart = timeToMinutes(paySettings.boundaries.saturdayEveningStart);
      return [
        { start: 0, end: saturdayEarlyEnd, multiplier: paySettings.rates.saturdayEarly, label: "Saturday before " + paySettings.boundaries.saturdayEarlyEnd },
        { start: saturdayEarlyEnd, end: saturdayEveningStart, multiplier: paySettings.rates.saturdayBase, label: "Saturday base" },
        { start: saturdayEveningStart, end: 1440, multiplier: paySettings.rates.saturdayEvening, label: "Saturday after " + paySettings.boundaries.saturdayEveningStart }
      ];
    }

    if (day === 0) {
      var sundayEarlyEnd = timeToMinutes(paySettings.boundaries.sundayEarlyEnd);
      var sundayEveningStart = timeToMinutes(paySettings.boundaries.sundayEveningStart);
      return [
        { start: 0, end: sundayEarlyEnd, multiplier: paySettings.rates.sundayEarly, label: "Sunday before " + paySettings.boundaries.sundayEarlyEnd },
        { start: sundayEarlyEnd, end: sundayEveningStart, multiplier: paySettings.rates.sundayBase, label: "Sunday base" },
        { start: sundayEveningStart, end: 1440, multiplier: paySettings.rates.sundayEvening, label: "Sunday after " + paySettings.boundaries.sundayEveningStart }
      ];
    }

    var weekdayEarlyEnd = timeToMinutes(paySettings.boundaries.weekdayEarlyEnd);
    var weekdayEveningStart = timeToMinutes(paySettings.boundaries.weekdayEveningStart);
    return [
      { start: 0, end: weekdayEarlyEnd, multiplier: paySettings.rates.weekdayEarly, label: "Weekday before " + paySettings.boundaries.weekdayEarlyEnd },
      { start: weekdayEarlyEnd, end: weekdayEveningStart, multiplier: paySettings.rates.weekdayBase, label: "Weekday base" },
      { start: weekdayEveningStart, end: 1440, multiplier: paySettings.rates.weekdayEvening, label: "Weekday after " + paySettings.boundaries.weekdayEveningStart }
    ];
  }

  function getPublicHolidayPayRules(paySettings) {
    var earlyEnd = timeToMinutes(paySettings.boundaries.publicHolidayEarlyEnd);
    var eveningStart = timeToMinutes(paySettings.boundaries.publicHolidayEveningStart);
    return [
      { start: 0, end: earlyEnd, multiplier: paySettings.rates.publicHolidayEarly, label: "Public Holiday before " + paySettings.boundaries.publicHolidayEarlyEnd },
      { start: earlyEnd, end: eveningStart, multiplier: paySettings.rates.publicHolidayBase, label: "Public Holiday base" },
      { start: eveningStart, end: 1440, multiplier: paySettings.rates.publicHolidayEvening, label: "Public Holiday after " + paySettings.boundaries.publicHolidayEveningStart }
    ];
  }

  function splitShiftByRules(start, end, rules) {
    return rules.map(function (rule) {
      var segmentStart = Math.max(start, rule.start);
      var segmentEnd = Math.min(end, rule.end);
      return {
        minutes: Math.max(segmentEnd - segmentStart, 0),
        multiplier: rule.multiplier,
        label: rule.label
      };
    }).filter(function (segment) {
      return segment.minutes > 0;
    });
  }

  function numberOrDefault(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  }

  function validTimeOrDefault(value, fallback) {
    return normalizeTimeValue(value) || fallback;
  }

  function normalizeTimeValue(value) {
    if (typeof value !== "string") return "";
    var match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return "";
    var hour = Number(match[1]);
    var minute = Number(match[2]);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return "";
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return "";
    return pad(hour) + ":" + pad(minute);
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
    var board = els.timeBoard || document.querySelector(".time-board");
    var boardHeight = board ? board.getBoundingClientRect().height : 0;
    if (!boardHeight) boardHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--board-height"));
    return (minutes / 1440) * boardHeight;
  }

  function getHeaderHeight() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 86;
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

  function formatCurrency(amount) {
    return "$" + (Number(amount) || 0).toFixed(2);
  }

  function formatMultiplier(multiplier) {
    var rounded = Math.round((Number(multiplier) || 0) * 100) / 100;
    return rounded.toFixed(2).replace(/\.?0+$/, "");
  }

  function formatPayslipDate(date) {
    return pad(date.getDate()) + "." + pad(date.getMonth() + 1) + "." + date.getFullYear();
  }

  function formatDisplayDate(date) {
    return date.getDate() + " " + date.toLocaleString("en", { month: "short", year: "numeric" });
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
        return normalizeState(parsed);
      }
    } catch (error) {
      return normalizeState({});
    }
    return normalizeState({});
  }

  function normalizeState(data) {
    return {
      workplaces: Array.isArray(data.workplaces) ? data.workplaces.map(normalizeWorkplace) : [],
      shifts: Array.isArray(data.shifts) ? data.shifts : [],
      publicHolidays: normalizePublicHolidays(data.publicHolidays)
    };
  }

  function normalizeWorkplace(workplace) {
    return Object.assign({}, workplace, {
      pay: getPaySettings(workplace)
    });
  }

  function normalizePublicHolidays(holidays) {
    if (!Array.isArray(holidays)) return [];
    return holidays.map(function (holiday) {
      if (typeof holiday === "string") {
        return { date: holiday, note: "" };
      }
      return {
        date: typeof holiday.date === "string" ? holiday.date : "",
        note: typeof holiday.note === "string" ? holiday.note : ""
      };
    }).filter(function (holiday) {
      return /^\d{4}-\d{2}-\d{2}$/.test(holiday.date);
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
  }

  function sortPublicHolidays() {
    state.publicHolidays.sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });
  }

  function isPublicHoliday(date) {
    return state.publicHolidays.some(function (holiday) {
      return holiday.date === date;
    });
  }

  function loadActiveView() {
    var storedView = localStorage.getItem(UI_STORAGE_KEY);
    return ["weekly", "monthly", "yearly"].indexOf(storedView) >= 0 ? storedView : "weekly";
  }

  function saveActiveView() {
    localStorage.setItem(UI_STORAGE_KEY, activeView);
  }

  function loadActivePage() {
    var storedPage = localStorage.getItem(UI_STORAGE_KEY + ".page");
    return ["roster", "earnings"].indexOf(storedPage) >= 0 ? storedPage : "roster";
  }

  function saveActivePage() {
    localStorage.setItem(UI_STORAGE_KEY + ".page", activePage);
  }

  function saveState() {
    saveLocalState();
    scheduleCloudSave();
  }

  function saveLocalState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function scheduleCloudSave() {
    if (!cloud.docRef || cloud.isApplyingRemote) return;
    clearTimeout(cloud.saveTimer);
    cloud.status = "Saving...";
    renderSyncUI();
    cloud.saveTimer = setTimeout(saveCloudStateNow, 250);
  }

  function saveCloudStateNow() {
    if (!cloud.docRef) return;
    cloud.docRef.set({
      workplaces: state.workplaces,
      shifts: state.shifts,
      publicHolidays: state.publicHolidays,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(function () {
      cloud.status = "Synced";
      renderSyncUI();
    }).catch(function () {
      cloud.status = "Sync error";
      renderSyncUI();
    });
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
