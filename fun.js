
function getUrl(cookie) {
  var newUrl =  "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
  console.log(newUrl);
  return newUrl;
}

function cleanDomain(domain) {
  x = domain;
  if (x.startsWith(".")) { x = x.slice(1,x.length) }
  console.log("domain was " + domain + " now returning as " + x);
  return x;

}

function deleteCookie(cookie) {
  var urlMatch = getUrl(cookie);
  console.log("called to delete cookie from " + urlMatch);
  chrome.cookies.remove({"url": urlMatch, "name": cookie.name}, function(val) { 
    if (val != null) { 
      console.log(val); messageToWindow("deleted cookie: " + cookie.name); 
    } else { messageToWindow("unable to delete cookie: " + cookie.name); }});  
}


function toDate(dateString) {
  if (dateString == "") {
    return undefined;
  } else {
    try {
      var intVal = new Date(dateString).valueOf();
      return intVal / 1000
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}

function createCookie(name, domain, value, path, sameSite, expirationDate, secure , httpOnly, originalCookie ) {
 deleteCookie(originalCookie);
 payload = {
   "url": getUrl({"secure": secure, "domain": cleanDomain(domain), "path": path}),
   "name": name,
   "value": value,
   // "domain": domain,
   "path": path,
   "secure": secure,
   "httpOnly": httpOnly,
   "sameSite": sameSite,
   "expirationDate": toDate(expirationDate)
 }

 // handle funny chrome api issue with leading . being forced if domain is specified (https://groups.google.com/a/chromium.org/forum/#!topic/chromium-extensions/9K5Auvrilbo)
if (domain.startsWith(".")) {
  payload["domain"] = domain
}

  chrome.cookies.set(payload, function(val) { 
    if (val != null ) {
      console.log(val); messageToWindow("saved cookie " + name); 
  } else {
    console.log(chrome.runtime.lastError);
    messageToWindow("unable to save cookie " + name); 
    // attempt to restore original cookie
    var op = {
      "url": getUrl({"secure": originalCookie.secure, "domain": cleanDomain(originalCookie.domain), "path": originalCookie.path}),
     "name": originalCookie.name,
     "value": originalCookie.value,
     // "domain": domain,
     "path": originalCookie.path,
     "secure": originalCookie.secure,
     "httpOnly": originalCookie.httpOnly,
     "sameSite": originalCookie.sameSite,
     "expirationDate": originalCookie.expirationDate
    };

    chrome.cookies.set(op, function(val) { messageToWindow("attempted to restore cookie " + name); onChangeState();})
  };    
});
}


function messageToWindow(message) {
  document.querySelector("#status").innerText = document.querySelector("#status").innerText + message + "\n";
  document.querySelector("#status").hidden = false;

  setTimeout(function() { document.querySelector("#status").innerText=""; document.querySelector("#status").setAttribute("hidden",true);}, 1500);
}


function generalizeDomain(d) {
  var splt = d.split(".")
  if (splt.length > 1) {
    return splt[splt.length -2] + "." + splt[splt.length-1];
  }
  return d
}

function populateCurrentDomain() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  		try {
        var tab = tabs[0];
  		  var url = new URL(tab.url);
  		  var domain = url.hostname;
  		  console.log("found domain: " + domain);
        // gen = generalizeDomain(domain);
        // console.log("generalized to domain: " + gen);
        // document.querySelector("#domainFilter").value = gen;
        document.querySelector("#domainFilter").value = domain;
        lookupCookies()
      } catch(error) {
        console.log(error)
      }
	})
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }


function clearCookies() {
  var table = document.querySelector("#cookiebox");
  while (table.rows.length > 0) {
    table.deleteRow(table.rows.length - 1);
  }
}

function cookieToId(cookie) {
  return (cookie.name == undefined ? "" : cookie.name) + 
  (cookie.domain  == undefined ? "" : cookie.domain) + 
  (cookie.path  == undefined ? "" : cookie.path) + (cookie.secure  == undefined ? "" : cookie.secure) 
}

function cookieToHtml(cookie, rownum) {
    
    
    var cols = [cookie.name, cookie.domain, cookie.value, cookie.path, cookie.sameSite, cookie.expirationDate];
    var colids = ['name', 'domain', 'value', 'path', 'samesite', 'expiration'];
        

    var boolCols = [cookie.secure, cookie.httpOnly];
    var boolColids = ['secure', 'httponly'];
        
	  
    var table = document.querySelector("#cookiebox");

      

      for (var i in cols) {

        var row = table.insertRow(-1);
        var cell = row.insertCell(-1);
        var label = document.createElement("div")
        label.innerText = colids[i];
        cell.appendChild(label);
      	
        var cell = row.insertCell(-1);
      	var div = document.createElement("div");
      	div.setAttribute("class", "flex-container");

      	var input = document.createElement("textarea");
      	input.setAttribute("class","fill-width");
      	input.setAttribute("rows", 1);
        input.setAttribute("id", colids[i]+rownum)
        if (colids[i] == 'expiration') {
          if (cols[i] == undefined) {
            input.value = "";  
          } else {
            input.value = new Date(cols[i]*1000).toISOString();
          }
        } else {
          input.value = cols[i];  
        }
      	
      	cell.appendChild(div)
      	div.appendChild(input);
      }

      // new row for booleans:
      var row = table.insertRow(-1);
      var cell = row.insertCell(-1);
      var label = document.createElement("div")
      label.innerText = "flags";
      cell.appendChild(label);
      var cell = row.insertCell(-1);

      for (var i in boolCols) {
        
        var label = document.createElement("div")
        label.setAttribute("class", "checkbox-inline");
        label.setAttribute("for", boolColids[i]);
        label.innerText = boolColids[i]
        cell.appendChild(label);
      
        var input = document.createElement("input");
        input.type="checkbox";
        input.setAttribute("id", boolColids[i]+rownum);
        if (boolCols[i]) {
          input.setAttribute("checked", true);
        }
        cell.appendChild(input);
      }
      
      var row = table.insertRow(-1);
      var cell = row.insertCell(-1);
      
    
      
      // delete button
      var cell = row.insertCell(-1);
      var div = document.createElement("div");
      div.setAttribute("class","flex-container");

      var deleteButton = document.createElement("button");
      deleteButton.innerText = "\u{1f5d1}";
      deleteButton.onclick = function() {
        deleteCookie(cookie);
        onChangeState();
      }
      div.appendChild(deleteButton);


      // save button
      // var cell = row.insertCell(-1);      
      var saveButton = document.createElement("button");
      saveButton.innerText = "\u{1F4BE}";
      saveButton.onclick = function() {
        //deleteCookie(cookie);
        newName = document.querySelector("#name" + rownum).value;
        newDomain =  document.querySelector("#domain" + rownum).value;
        newValue =  document.querySelector("#value" + rownum).value;
        newPath =  document.querySelector("#path" + rownum).value;
        newExpirationDate =  document.querySelector("#expiration" + rownum).value;
        newSecure =  document.querySelector("#secure" + rownum).checked;
        newHttpOnly =  document.querySelector("#httponly" + rownum).checked;
        newSameSite =  document.querySelector("#samesite" + rownum).value;
        createCookie(newName, newDomain, newValue, newPath, newSameSite, newExpirationDate, newSecure, newHttpOnly, cookie ) ;
        onChangeState();
      }
      div.appendChild(saveButton);
      cell.appendChild(div);


      var row = table.insertRow(-1);
      var cell = row.insertCell(-1);
      var cell = row.insertCell(-1);
      var hr = document.createElement("hr")
      cell.appendChild(hr);


}

function renderCookie(cookie, rownum) {
  //console.log(cookie);
   cookieToHtml(cookie, rownum)
}


function isFilterMatch(testvalue, filter) {
	// console.log("testing " + testvalue + " against " + filter)
	if (testvalue == undefined || filter == undefined) {
		return false
	}

	return testvalue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
}


// foo.bar.com

/*
foo.bar.com
.foo.bar.com
.bar.com




NOT
bar.com
baz.bar.com


*/

function ingestWithDomainFilter(cookies, domainFilter) {
 var cookieCount = 0;
 var subCookieCount = 0;

  for (var i in cookies) {

     	// if ( isFilterMatch(cookies[i].domain, domainFilter) ) {
      // 		renderCookie(cookies[i], i);
      // }
      // trim any leading .


      if ( cookies[i].domain.toLowerCase() == domainFilter.toLowerCase() || cookies[i].domain.toLowerCase() == "." + domainFilter.toLowerCase()) {
        renderCookie(cookies[i], i);
        cookieCount += 1;
        subCookieCount += 1;
      }
       else if (cookies[i].domain.startsWith(".") && isFilterMatch(domainFilter, cookies[i].domain)) {
          renderCookie(cookies[i], i);   
          cookieCount += 1;

      } else if (domainFilter.startsWith(".") && isFilterMatch(cookies[i].domain, domainFilter) ) {
          renderCookie(cookies[i], i);
          cookieCount += 1;

      }
  
    }
    document.querySelector("#cookiecount").innerText = "found " + cookieCount + " cookie(s) in overall scope\n" +  "found " + subCookieCount + " cookie(s) for this subdomain";
}



function cookieSort(cookieArray) {
  cookieArray.sort((a, b) => (a.domain + a.name> b.domain + b.name) ? -1 : 1)
}

function onChangeState() {
	clearCookies();
  lookupCookies();
}

function lookupCookies() {
	filter = document.querySelector("#domainFilter").value
	chrome.cookies.getAll({}, function(cookies) {
      cookieSort(cookies)
   		ingestWithDomainFilter(cookies, filter) 
  });
}

