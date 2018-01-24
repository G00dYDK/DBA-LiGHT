// ==UserScript==
// @name         DBA LiGHT
// @namespace    http://www.dba.dk/
// @version      2.00
// @description  Light up dba.dk (bloaded p.o.s.)
// @author       Me!
// @match        htt*://www.dba.dk/computer-og-spillekonsoller/s*
// @match        htt*://www.dba.dk/computer-og-spillekonsoller/?soeg=macintosh*
// @grant        GM_getResourceText
// @require      https://code.jquery.com/jquery-3.1.0.min.js
// @run-at       document-start
// @resource     WordFilters        https://raw.githubusercontent.com/G00dYDK/DBAL_Res/master/WordFilter20180124_3.json
// @resource     ElementFilters     https://raw.githubusercontent.com/G00dYDK/DBAL_Res/master/ElementFilter20180124_1.json
// @resource     CustomCSS          https://raw.githubusercontent.com/G00dYDK/DBAL_Res/master/CustomCSSCustomCSS20180124_1.css
// @resource     Keywords           https://raw.githubusercontent.com/G00dYDK/DBAL_Res/master/Keywords.json
// ==/UserScript==
/*global GM_getResourceText*/

var jq = $.noConflict();
var url = window.location.href;
var wordFilter = ConvertToArray(GM_getResourceText('WordFilters'));
var elementFilter = ConvertToArray(GM_getResourceText('ElementFilters'));
var itemsToLookFor = ConvertToArray(GM_getResourceText('Keywords'));
var customCSS = GM_getResourceText('CustomCSS');
var orgTitle = document.title;
var removedElements = [];

FixQueryFilter();
HideElementsByCss();

jq(document).ready(function() {
    HideContentElements();
    GoOggle();
    FixLazyCrap();
    DoTimerStuff();
    FixLinks();
});

function FixLinks(){
 jq("a.listingLink").attr('target','_blank');
}

function HideContentElements(){
    jq.each( wordFilter, function( wordIndex, filterWord ) {
        var elementsToHide = jq("div.dbaListing:contains('"+filterWord+"'):visible");
        if(elementsToHide.length > 0 & elementsToHide.is(":visible"))
        {
            removedElements.push(filterWord + " (" + elementsToHide.length + ")");
            elementsToHide.hide();
        }
    });
    jq("ul.tabs160").append('<li style="color: #333;font-size: 12px;font-weight: normal; width:200px;"><span id="removedItems" style="height:auto;line-height:15px;margin-bottom:5px;">Frafiltreret ord: </span></li>');

    jq.each( removedElements, function( removedElementIndex, removedElement ) {
        jq("#removedItems").append(removedElement);
        if(removedElementIndex != removedElements.length - 1)
            jq("#removedItems").append(", ");
    });
}

//Find the keywords prev. added
function GoOggle(){
    var elementsToSearchThrough = jq("div.dbaListing:visible a.listingLink span.listingLinkInner span.text");
    var foundElements = [];
    jq.each( itemsToLookFor, function( keywordIndex, keyword ) {
        var eleIndex;
        jq.each( elementsToSearchThrough, function( elementIndex, element ) {
            eleIndex = elementIndex;
            var result = (RegExp("\\b" + keyword.toUpperCase() + "\\b").test(jq(element).text().toUpperCase()));
            if(result){
                foundElements.push(element);
            }
        });
    });
    foundElements = jq.unique(foundElements);
    if(foundElements.length > 0)
    {
        var marks= "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!";
        var message = "Hey";
        message = message + marks.substr(0,foundElements.length);

        document.title = message + " - " + orgTitle;
    }
}

function FixLazyCrap(){
    var lazyStuff = jq('.image-placeholder:visible');
    //while(lazyStuff.length > 0){
        jq.each( lazyStuff, function( index, element ) {
            var lazyElement = jq(element);
            var realSrc = lazyElement.attr('data-original');

            lazyElement.removeClass('lazy');
            lazyElement.attr('src',realSrc);
            lazyElement.css('display','block');
            lazyElement.css('background-image','url("'+realSrc);
            lazyElement.addClass('cool');
        });
        lazyStuff = jq('.image-placeholder');
    //}
}

function DoTimerStuff(){
    jq("ul.tabs160").prepend('<li style="color: #333;font-size: 12px;font-weight: normal;"><span id="countdown" style="height:auto;line-height:15px;margin-bottom:5px;"></span></li>');

    // p.countdown as container, pass redirect, duration, and optional message
    jq("#countdown").countdown(redirect, 120, "Opdaterer om: ");
}

function FixQueryFilter(){
    //var search = getParameterByName('soeg',url);
    if(url.indexOf("soeg") == -1 && url.indexOf("soeg=macintosh") != -1){
        //if(url.indexOf("soeg") != -1)
            //url+="?soeg="+search;
        if(url.indexOf("fra") == -1)
            url+="?fra=privat";
        if(url.indexOf("sort") == -1)
            url+="&sort=listingdate-desc";
        if(url.indexOf("vis") == -1)
            url+="&vis=galleri";
        if(url.indexOf("filter") != -1)
            url+="&filter="+usefilter;

        if(window.location.href != url)
            window.location.href = url;
    }
}

function HideElementsByCss(){
    var head = document.head || document.getElementsByTagName('head')[0];
    var stylesheet = document.createElement('style');
    stylesheet.type = 'text/css';
    jq.each( elementFilter, function( elementIndex, element ) {
        stylesheet.appendChild(document.createTextNode(element + ' { display: none !important; }\n\r'));
    });

    stylesheet.innerHTML = stylesheet.innerHTML + customCSS;
    head.appendChild(stylesheet);
}

jq.fn.countdown = function (callback, duration, message) {
    // If no message is provided, we use an empty string
    message = message || "";
    // Get reference to container, and set initial content
    var container = jq(this[0]).html(message + duration);
    // Get reference to the interval doing the countdown
    var countdown = setInterval(function () {
        // If seconds remain
        if (--duration) {
            // Update our container's message
            container.html(message + duration);
            // Otherwise
        } else {
            // Clear the countdown interval
            clearInterval(countdown);
            // And fire the callback passing our container as `this`
            callback.call(container);
        }
        // Run interval every 1000ms (1 second)
    }, 1000);

};

// Function to be called after 120 seconds
function redirect () {
    this.html("Kryds fingre for guf!");
    window.location = window.location.href;
}

function ConvertToArray(fakeArray){
    if(fakeArray){
        return JSON.parse(fakeArray).replace('[','').replace(']','').replace(new RegExp('"', 'g'), '').split(',');
    }
    else{
        return [];
    }
}

jq.expr[":"].contains = jq.expr.createPseudo(function(arg) {
    return function( elem ) {
        return (RegExp("\\b" + arg.toUpperCase() + "\\b").test(jq(elem).text().toUpperCase()));
    };
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
