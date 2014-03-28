var moment = require('moment'),
    _ = require('underscore');

moment.lang('sv', {
        months : "januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),
        monthsShort : "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
        weekdays : "söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),
        weekdaysShort : "sön_mån_tis_ons_tor_fre_lör".split("_"),
        weekdaysMin : "sö_må_ti_on_to_fr_lö".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            L : "YYYY-MM-DD",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd D MMMM YYYY LT"
        },
        calendar : {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[Igår] LT',
            nextWeek: 'dddd LT',
            lastWeek: '[Förra] dddd[en] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : "om %s",
            past : "för %s sedan",
            s : "några sekunder",
            m : "en minut",
            mm : "%d minuter",
            h : "en timme",
            hh : "%d timmar",
            d : "en dag",
            dd : "%d dagar",
            M : "en månad",
            MM : "%d månader",
            y : "ett år",
            yy : "%d år"
        },
        ordinal : function (number) {
            var b = number % 10,
                output = (~~ (number % 100 / 10) === 1) ? 'e' :
                (b === 1) ? 'a' :
                (b === 2) ? 'a' :
                (b === 3) ? 'e' : 'e';
            return number + output;
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });

// Strips tags from the caption.text part of an update
module.exports.strip_tags = function(item) {
  if(item.caption && item.caption.text && ~item.caption.text.indexOf('#')) {
    var stripped = _.filter(item.caption.text.split(' '),
                            function(item) {
                              return item.indexOf('#');
                            }).join(' ');
    item.caption.text = stripped;
  }
  return item;
};

module.exports.parse_date = function(item) {
  if(item.created_time) {
    var date = new Date(item.created_time);
    item.datetime = moment(item.created_time * 1000).toISOString();
    item.display_time_short = moment(item.created_time * 1000).format('HH:mm.ss');
    item.display_time_long = moment(item.created_time * 1000).format('HH:mm Do MMMM YYYY');
  }
  return item;
};
