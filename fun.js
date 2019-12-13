
function getUrl(cookie) {
  var newUrl =  "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
  console.log(newUrl);
  return newUrl;
}

function cleanDomain(domain) {
  x = domain;
  if (x.startsWith(".")) { x = x.slice(1,x.length) }
  return x;
}

function deleteCookie(cookie) {
  var urlMatch = getUrl(cookie);
  console.log("called to delete cookie from " + urlMatch);
  chrome.cookies.remove({"url": urlMatch, "name": cookie.name});
}

function createCookie(name, domain, value, path, sameSite, expirationDate, secure , httpOnly, originalCookie ) {
 deleteCookie(originalCookie);
 chrome.cookies.set({
   "url": getUrl({"secure": secure, "domain": cleanDomain(domain), "path": path}),
   "name": name,
   "value": value,
   "domain": domain,
   "path": path,
   "secure": secure,
   "httpOnly": httpOnly,
   "sameSite": sameSite,
   "expirationDate": parseInt(expirationDate)
 });    
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
        gen = generalizeDomain(domain);
        console.log("generalized to domain: " + gen);
        document.querySelector("#domainFilter").value = gen;
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
  while (table.rows.length > 1) {
    table.deleteRow(table.rows.length - 1);
  }
}

function cookieToId(cookie) {
  return (cookie.name == undefined ? "" : cookie.name) + 
  (cookie.domain  == undefined ? "" : cookie.domain) + 
  (cookie.path  == undefined ? "" : cookie.path) + (cookie.secure  == undefined ? "" : cookie.secure) 
}

function cookieToHtml(cookie, rownum) {
    
	  var rowChars = 15
    
    var cols = [cookie.name, cookie.domain, cookie.value, cookie.path, cookie.sameSite, cookie.expirationDate];
    var colids = ['name', 'domain', 'value', 'path', 'samesite', 'expirationdate'];
        

    var boolCols = [cookie.secure, cookie.httpOnly];
    var boolColids = ['secure', 'httponly'];
        


    longestVal = rowChars
    for (var v in cols) {
      if (cols[v] != undefined && cols[v].length > longestVal) {
        longestVal = cols[v].length
      }
    }
	  rowsVal = Math.ceil(cookie.value.length / rowChars);
	  var table = document.querySelector("#cookiebox");
      var row = table.insertRow(-1);

      // action column
      
      // delete button
      var cell = row.insertCell(-1);
      var deleteButton = document.createElement("button");
      deleteButton.innerText = "del";
      deleteButton.onclick = function() {
        deleteCookie(cookie);
        onChangeState();
      }
      cell.appendChild(deleteButton);


      // save button
      
      var saveButton = document.createElement("button");
      saveButton.innerText = "save";
      saveButton.onclick = function() {
        //deleteCookie(cookie);
        newName = document.querySelector("#name" + rownum).value;
        newDomain =  document.querySelector("#domain" + rownum).value;
        newValue =  document.querySelector("#value" + rownum).value;
        newPath =  document.querySelector("#path" + rownum).value;
        newExpirationDate =  document.querySelector("#expirationdate" + rownum).value;
        newSecure =  document.querySelector("#secure" + rownum).checked;
        newHttpOnly =  document.querySelector("#httponly" + rownum).checked;
        newSameSite =  document.querySelector("#samesite" + rownum).value;
        createCookie(newName, newDomain, newValue, newPath, newSameSite, newExpirationDate, newSecure, newHttpOnly, cookie ) ;
        onChangeState();
      }
      cell.appendChild(saveButton);



      for (var i in cols) {
      	var cell = row.insertCell(-1);
      	var div = document.createElement("div");
      	div.setAttribute("class", "flex-container");

      	var input = document.createElement("textarea");
      	input.setAttribute("class","fill-width");
      	input.setAttribute("rows", rowsVal);
        input.setAttribute("id", colids[i]+rownum)
      	input.value = cols[i];
      	cell.appendChild(div)
      	div.appendChild(input);
      }

      for (var i in boolCols) {
        var cell = row.insertCell(-1);
        
        var input = document.createElement("input");
        input.type="checkbox";
        input.setAttribute("id", boolColids[i]+rownum);
        if (boolCols[i]) {
          input.setAttribute("checked", true);
        }
        cell.appendChild(input);
      }
}

function renderCookie(cookie, rownum) {
  console.log(cookie);
   cookieToHtml(cookie, rownum)
}


function isFilterMatch(testvalue, filter) {
	// console.log("testing " + testvalue + " against " + filter)
	if (testvalue == undefined || filter == undefined) {
		return false
	}

	return testvalue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
}


function ingestWithDomainFilter(cookies, domainFilter) {
	for (var i in cookies) {
     	//  console.log(cookies[i]);
     	if (isFilterMatch(cookies[i].domain, domainFilter)) {
      		renderCookie(cookies[i], i);
       	}
    }
}

function cookieSort(cookieArray) {
  cookieArray.sort((a, b) => (a.domain + a.name> b.domain + b.name) ? 1 : -1)
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

