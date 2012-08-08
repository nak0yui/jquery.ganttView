/*
 jQuery.ganttView v.0.8.8
 Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com
 MIT License Applies
 */

/*
 Options
 -----------------
 showWeekends: boolean
 showDayOfWeeks: boolean
 data: object
 cellWidth: number
 cellHeight: number
 slideWidth: number
 dataUrl: string
 start: string
 end: string
 behavior: {
   clickable: boolean,
   draggable: boolean,
   resizable: boolean,
   onClick: function,
   onDrag: function,
   onResize: function
 }
 linkHrefs : {
   "1": string,
   "2": string,
   "3": string
 }
 blockText: string
 */

(function ($) {
  
  $.fn.ganttView = function () {
    
    var args = Array.prototype.slice.call(arguments);
    
    if (args.length == 1 && typeof(args[0]) == "object") {
      build.call(this, args[0]);
    }
    
    if (args.length == 2 && typeof(args[0]) == "string") {
      handleMethod.call(this, args[0], args[1]);
    }
  };
  
  function build(options) {
    
    var els = this;
    var defaults = {
      dataLevel: 2,
      showWeekends: true,
      showDayOfWeeks: false,
      cellWidth: 21,
      cellHeight: 31,
      slideWidth: 400,
      vHeaderWidth: 100,
      behavior: {
        clickable: true,
        draggable: true,
        resizable: true
      },
      linkHrefs : {
        "1": false,
        "2": false,
        "3": false
      },
      blockText: false

    };
    
    var opts = $.extend(true, defaults, options);

    if (opts.data) {
      build();
    } else if (opts.dataUrl) {
      $.getJSON(opts.dataUrl, function (data) { opts.data = data; build(); });
    }

    function build() {
      
      var minDays = Math.floor((opts.slideWidth / opts.cellWidth)  + 5);
      var startEnd = DateUtils.getBoundaryDatesFromData(opts.data, minDays);
      if (typeof opts.start === "undefined") {
        opts.start = startEnd[0];
      } else {
        opts.start = new Date(opts.start);
        if (startEnd[0].compareTo(opts.start) === -1) {
          opts.start = startEnd[0];
        };
      }
      if (typeof opts.end === "undefined") {
        opts.end = startEnd[1];
      } else {
        opts.end = new Date(opts.end);
        opts.end = DateUtils.getMaxEndForWhitespaceOfGrid(opts.start, opts.end, minDays);
        if (startEnd[1].compareTo(opts.end) === 1) {
          opts.end = startEnd[1];
        };
      }
      
      els.each(function () {

        var container = $(this);
        var div = $("<div>", { "class": "ganttview" });
        new Chart(div, opts).render();
        container.append(div);
        
        var w = $("div.ganttview-vtheader", container).outerWidth() +
              $("div.ganttview-slide-container", container).outerWidth();
        container.css("width", (w + 2) + "px");
        
        new Behavior(container, opts).apply();
      });
    }
  }

  function handleMethod(method, value) {
    
    if (method == "setSlideWidth") {
      var div = $("div.ganttview", this);
      div.each(function () {
        var vtWidth = $("div.ganttview-vtheader", div).outerWidth();
        $(div).width(vtWidth + value + 1);
        $("div.ganttview-slide-container", this).width(value);
      });
    }
  }

  var Chart = function(div, opts) {
    
    function render() {
      addVtHeader(div, opts.data, opts.cellHeight, opts.dataLevel, opts.linkHrefs);
      
      var slideDiv = $("<div>", {
        "class": "ganttview-slide-container",
        "css": { "width": opts.slideWidth + "px" }
      });
      
      var dates = getDates(opts.start, opts.end);
      addHzHeader(slideDiv, dates, opts.cellWidth, opts.showDayOfWeeks);
      addGrid(slideDiv, opts.data, dates, opts.cellWidth, opts.showWeekends);
      addBlockContainers(slideDiv, opts.data);
      addBlocks(slideDiv, opts.data, opts.cellWidth, opts.start, opts.blockText);
      div.append(slideDiv);
      applyLastClass(div.parent());
    }

    // Creates a 3 dimensional array [year][month][day] of every day 
    // between the given start and end dates
    function getDates(start, end) {
      var dates = [];
      dates[start.getFullYear()] = [];
      dates[start.getFullYear()][start.getMonth()] = [start];
      var last = start;
      while (last.compareTo(end) == -1) {
        var next = last.clone().addDays(1);
        if (!dates[next.getFullYear()]) { dates[next.getFullYear()] = []; }
        if (!dates[next.getFullYear()][next.getMonth()]) {
          dates[next.getFullYear()][next.getMonth()] = [];
        }
        dates[next.getFullYear()][next.getMonth()].push(next);
        last = next;
      }
      return dates;
    }

    function addVtHeader(div, data, cellHeight, level, hrefs) {
      var headerDiv = $("<div>", { "class": "ganttview-vtheader" });
      if (level === 3) {
        addVtHeader3(headerDiv, data, cellHeight, hrefs);
      } else if (level === 2) {
        addVtHeader2(headerDiv, data, cellHeight, hrefs);
      }
      div.append(headerDiv);
    }
    
    function addVtHeader3(parentDiv, data, cellHeight, hrefs) {
      var recordsDiv = $("<div>", { "class": "ganttview-vtheader-records" });
      for (var i = 0; i < data.length; i++) {
        var height = 0;
        $.each(data[i].records, function(j) {
          height = height + data[i].records[j].series.length * (cellHeight + 1);
        });
        height = height - 1;
        var recordNameDiv = $("<div>", {
          "class": "ganttview-vtheader-record-name",
          "css": { "height": height + "px"}
        });
        
        if (hrefs["1"] !== false) {
          var href = hrefs["1"];
          var $a = $("<a>");
          $.each(data[i], function(key) {
            href = href.replace("{" + key + "}", this);
          });
          $a.attr("href", href).append(data[i].name);
          recordNameDiv.append($a);
        } else {
          recordNameDiv.append(data[i].name);
        }
        
        recordsDiv.append(recordNameDiv);
        var itemsDiv = $("<div>", { "class": "ganttview-vtheader-items" });
        addVtHeader2(itemsDiv, data[i].records, cellHeight, hrefs);
        recordsDiv.append(itemsDiv);
      }
      parentDiv.append(recordsDiv);
    }
    
    function addVtHeader2(parentDiv, data, cellHeight, hrefs) {
      for (var i = 0; i < data.length; i++) {
        var itemDiv = $("<div>", { "class": "ganttview-vtheader-item" });
        var itemNameDiv = $("<div>", {
          "class": "ganttview-vtheader-item-name",
          "css": { "height": (data[i].series.length * cellHeight) + "px" }
        });
        var href = "";
        if (hrefs["2"] !== false) {
          var $a2 = $("<a>");
          href = hrefs["2"];
          $.each(data[i], function(key) {
            href = href.replace("{" + key + "}", this);
          });
          $a2.attr("href", href).append(data[i].name);
          itemNameDiv.append($a2);
        } else {
          itemNameDiv.append(data[i].name);
        }
        
        if (i === 0) {
          itemNameDiv.addClass("first");
        }
        itemDiv.append(itemNameDiv);
        var seriesDiv = $("<div>", { "class": "ganttview-vtheader-series" });
        for (var j = 0; j < data[i].series.length; j++) {
          var seriesNameDiv = $("<div>", {
            "class": "ganttview-vtheader-series-name"
          });
          
          href = "";
          if (hrefs["3"] !== false) {
            var $a3 = $("<a>");
            href = hrefs["3"];
            $.each(data[i].series[j], function(key) {
              href = href.replace("{" + key + "}", this);
            });
            $a3.attr("href", href).append(data[i].series[j].name);
            seriesNameDiv.append($a3);
          } else {
            seriesNameDiv.append(data[i].series[j].name);
          }

          if (i === 0 && j === 0) {
            seriesNameDiv.addClass("first");
          }
          seriesDiv.append(seriesNameDiv);
        }
        itemDiv.append(seriesDiv);
        parentDiv.append(itemDiv);
      }
    }
    
    function addHzHeader(div, dates, cellWidth, showDayOfWeeks) {
      var headerDiv = $("<div>", { "class": "ganttview-hzheader" });
      var monthsDiv = $("<div>", { "class": "ganttview-hzheader-months" });
      var daysDiv = $("<div>", { "class": "ganttview-hzheader-days" });
      var dayofweeksDiv = $("<div>", { "class": "ganttview-hzheader-dayofweeks" });
      var totalW = 0;
      for (var y in dates) {
        for (var m in dates[y]) {
          var w = dates[y][m].length * cellWidth;
          totalW = totalW + w;
          monthsDiv.append($("<div>", {
            "class": "ganttview-hzheader-month",
            "css": { "width": (w - 1) + "px" }
          }).append(dates[y][m][0].toString("yyyy年M月")));
          for (var d in dates[y][m]) {
            var dayDiv = $("<div>", { "class": "ganttview-hzheader-day" }).append(dates[y][m][d].getDate());
            daysDiv.append(dayDiv);
            var dayofweekDiv = $("<div>", { "class": "ganttview-hzheader-dayofweek" }).append(DateUtils.getDayOfWeekString(dates[y][m][d]));
            dayofweeksDiv.append(dayofweekDiv);
            if(DateUtils.isWeekend(dates[y][m][d])){
              dayDiv.addClass(dates[y][m][d].toString("ddd"));
              dayofweekDiv.addClass(dates[y][m][d].toString("ddd"));
            }
            if(DateUtils.isLastDayOfMonth(dates[y][m][d])){
              dayDiv.addClass("ganttview-lastdayofmonth");
              dayofweekDiv.addClass("ganttview-lastdayofmonth");
            }
          }
        }
      }
      monthsDiv.css("width", totalW + 1 + "px");
      daysDiv.css("width", totalW + 1 + "px");
      dayofweeksDiv.css("width", totalW + 1 + "px");
      headerDiv.append(monthsDiv).append(daysDiv);
      if (showDayOfWeeks) {
        headerDiv.append(dayofweeksDiv);
      }
      div.append(headerDiv);
    }

    function addGrid(div, data, dates, cellWidth, showWeekends) {
      var gridDiv = $("<div>", { "class": "ganttview-grid" });
      var rowDiv = $("<div>", { "class": "ganttview-grid-row" });
      var gridAppend = function(data, isfirst) {
        var i;
        for (i = 0; i < data.length; i++) {
          if (typeof data[i].records !== "undefined") {
            gridAppend(data[i].records);
            continue;
          }
          if (typeof data[i].series !== "undefined") {
            gridAppend(data[i].series, i === 0);
            continue;
          }
          if (typeof data[i].items !== "undefined" || typeof data[i] === "object") {
            var cloneRowDiv = rowDiv.clone();
            if (isfirst && i === 0) {cloneRowDiv.addClass("first");}
            gridDiv.append(cloneRowDiv);
            continue;
          }
        }
      };

      for (var y in dates) {
        for (var m in dates[y]) {
          for (var d in dates[y][m]) {
            var cellDiv = $("<div>", { "class": "ganttview-grid-row-cell" });
            if (DateUtils.isWeekend(dates[y][m][d]) && showWeekends) {
              cellDiv.addClass("ganttview-weekend").addClass(dates[y][m][d].toString("ddd"));
            }
            if (DateUtils.isLastDayOfMonth(dates[y][m][d])) {
              cellDiv.addClass("ganttview-lastdayofmonth");
            }
            rowDiv.append(cellDiv);
          }
        }
      }
      var w = $("div.ganttview-grid-row-cell", rowDiv).length * cellWidth;
      rowDiv.css("width", w + 1 + "px");
      gridDiv.css("width", w + 1 + "px");
      gridAppend(data);
      div.append(gridDiv);
    }

    function addBlockContainers(div, data) {
      var blocksDiv = $("<div>", {
        "class": "ganttview-blocks"
      }),
          blocksAppend = function(data) {
            var i;
            if (typeof data.records !== "undefined") {
              for (i = 0; i < data.records.length; i++) {
                blocksAppend(data.records[i]);
              }
            }
            if (typeof data.series !== "undefined") {
              for (i = 0; i < data.series.length; i++ ) {
                blocksDiv.append($("<div>", { "class": "ganttview-block-container" }));
              }
            }
          };
      for (var i = 0; i < data.length; i++) {
        blocksAppend(data[i]);
      }
      div.append(blocksDiv);
    }

    function addBlocks(div, data, cellWidth, start, blockText) {
      var rows = $("div.ganttview-blocks div.ganttview-block-container", div);
      var rowIdx = 0;
      var rowAppendBlock = function(data, title) {
        var i;
        if (typeof data.records !== "undefined") {
          for (i = 0; i < data.records.length; i++) {
            rowAppendBlock(data.records[i]);
          }
        }
        else if (typeof data.series !== "undefined") {
          for (i = 0; i < data.series.length; i++ ) {
            var seriesTitle = data.series[i].name;
            rowAppendBlock(data.series[i], seriesTitle);
          }
        }
        else if (typeof data.items !== "undefined") {
          if (data.items.length === 0) {
            rowIdx++;
          } else {
            for (i = 0; i < data.items.length; i++) {
              rowAppendBlock(data.items[i], title);
              if (typeof data.items[i+1] !== "undefined") {rowIdx--;}
            }
          }
        }
        else if (typeof data === "object") {
          var item = data;
          var size = DateUtils.daysBetween(item.start, item.end) + 1;
          var offset = DateUtils.daysBetween(start, item.start);
          var $blockText =  $("<div>", { "class": "ganttview-block-text" });
          var text;
          if (blockText === false) {
            text = size;
          } else {
            text = blockText;
            $.each(data, function(key) {
              text = text.replace("{" + key + "}", this);
            });
            while (text.search(/{.+?}/) !== -1) {
              text = text.replace(/{.+?}/, "");
            }
            text = text + ", " + size;
          }
          $blockText.text(text);
          var block = $("<div>", {
            "class": "ganttview-block",
            "title": title + ", " + text + " days",
            "css": {
              "width": ((size * cellWidth) - 9) + "px",
              "margin-left": ((offset * cellWidth) + 3) + "px"
            }
          });
          if (item.color) {
            block.css("background-color", item.color);
          }
          
          block.append($blockText);
          $(rows[rowIdx]).append(block);
          rowIdx++;
        }
      };
      
      for (var i = 0; i < data.length; i++) {
        rowAppendBlock(data[i], "", 0);
      }
      
    }
    
    function addBlockData(block, data, item) {
      // This allows custom attributes to be added to the item data objects
      // and makes them available to the 'data' argument of click, resize, and drag handlers
      var blockData = { id: data.id, name: data.name };
      $.extend(blockData, item);
      block.data("block-data", blockData);
    }

    function applyLastClass(div) {
      $("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", div).addClass("last");
      $("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", div).addClass("last");
      $("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", div).addClass("last");
    }
    
    return {
      render: render
    };
  }

  var Behavior = function (div, opts) {
    
    function apply() {
      
      if (opts.behavior.clickable) {
        bindBlockClick(div, opts.behavior.onClick); 
      }
      
      if (opts.behavior.resizable) {
        bindBlockResize(div, opts.cellWidth, opts.start, opts.behavior.onResize); 
      }
      
      if (opts.behavior.draggable) {
        bindBlockDrag(div, opts.cellWidth, opts.start, opts.behavior.onDrag); 
      }
    }

    function bindBlockClick(div, callback) {
      $("div.ganttview-block", div).live("click", function () {
        if (callback) { callback($(this).data("block-data")); }
      });
    }
    
    function bindBlockResize(div, cellWidth, startDate, callback) {
      $("div.ganttview-block", div).resizable({
        grid: cellWidth,
        handles: "e,w",
        stop: function () {
          var block = $(this);
          updateDataAndPosition(div, block, cellWidth, startDate);
          if (callback) { callback(block.data("block-data")); }
        }
      });
    }
    
    function bindBlockDrag(div, cellWidth, startDate, callback) {
      $("div.ganttview-block", div).draggable({
        axis: "x",
        grid: [cellWidth, cellWidth],
        stop: function () {
          var block = $(this);
          updateDataAndPosition(div, block, cellWidth, startDate);
          if (callback) { callback(block.data("block-data")); }
        }
      });
    }
    
    function updateDataAndPosition(div, block, cellWidth, startDate) {
      var container = $("div.ganttview-slide-container", div);
      var scroll = container.scrollLeft();
      var offset = block.offset().left - container.offset().left - 1 + scroll;
      
      // Set new start date
      var daysFromStart = Math.round(offset / cellWidth);
      var newStart = startDate.clone().addDays(daysFromStart);
      block.data("block-data").start = newStart;

      // Set new end date
      var width = block.outerWidth();
      var numberOfDays = Math.round(width / cellWidth) - 1;
      block.data("block-data").end = newStart.clone().addDays(numberOfDays);
      $("div.ganttview-block-text", block).text(numberOfDays + 1);
      
      // Remove top and left properties to avoid incorrect block positioning,
      // set position to relative to keep blocks relative to scrollbar when scrolling
      block.css("top", "").css("left", "")
        .css("position", "relative").css("margin-left", offset + "px");
    }
    
    return {
      apply: apply
    };
  }

  var ArrayUtils = {
    
    contains: function (arr, obj) {
      var has = false;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == obj) { has = true; }
      }
      return has;
    }
  };

  var DateUtils = {
    dayset: ['日', '月', '火', '水', '木', '金', '土'],
    
    getDayOfWeekString: function(date) {
      return this.dayset[date.getDay()];
    },
    
    isFirstDayOfMonth: function(date) {
      var date1 = new Date(date);
      date1.addDays(-1);
      return (
        (   date.getYear() === date1.getYear() &&
            date.getMonth() === date1.getMonth()
        ) === false
      );
    },
    
    isLastDayOfMonth: function(date) {
      var date1 = new Date(date);
      date1.addDays(1);
      return (
        (   date.getYear() === date1.getYear() &&
            date.getMonth() === date1.getMonth()
        ) === false
      );
    },
    
    daysBetween: function (start, end) {
      if (!start || !end) { return 0; }
      start = Date.parse(start); end = Date.parse(end);
      if (start.getYear() == 1901 || end.getYear() == 8099) { return 0; }
      var count = 0, date = start.clone();
      while (date.compareTo(end) == -1) { count = count + 1; date.addDays(1); }
      return count;
    },
    
    isWeekend: function (date) {
      return date.getDay() % 6 == 0;
    },

    getBoundaryDatesFromData: function (data, minDays) {
      var minStart,
          maxEnd,
          getMinAndMaxDate = function(data) {
            var i,
            start = Date.parse(data.start),
            end = Date.parse(data.end);
            if (start === null && end === null) {
              for (i = 0; i < data.length; i++) {
                if (typeof data[i].records !== "undefined") {
                  getMinAndMaxDate(data[i].records);
                  continue;
                }
                if (typeof data[i].series !== "undefined") {
                  getMinAndMaxDate(data[i].series);
                  continue;
                }
                if (typeof data[i].items !== "undefined") {
                  getMinAndMaxDate(data[i].items);
                  continue;
                }
                if (typeof data[i] === "object") {
                  getMinAndMaxDate(data[i]);
                  continue;
                }
              }
            } else {
              if (typeof minStart === "undefined" || minStart.compareTo(start) == 1) { minStart = start; }
              if (typeof maxEnd === "undefined" || maxEnd.compareTo(end) == -1) { maxEnd = end; }
            }
          };
      
      getMinAndMaxDate(data);
      
      if (typeof minStart === "undefined") {
        minStart = new Date();
        maxEnd = new Date();
      }
      
      // Insure that the width of the chart is at least the slide width to avoid empty
      // whitespace to the right of the grid
      maxEnd = this.getMaxEndForWhitespaceOfGrid(minStart, maxEnd, minDays);
      return [minStart, maxEnd];
    },
    
    getMaxEndForWhitespaceOfGrid: function(minStart, maxEnd , minDays) {
      if (DateUtils.daysBetween(minStart, maxEnd) < minDays) {
        return minStart.clone().addDays(minDays);
      } else {
        return maxEnd;
      }
    }
  };

})(jQuery);
