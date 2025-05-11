// Create a listenter on update of tabs 
//-------------------------------------------------------------------------------------
// chrome.tabs.onUpdated event, which is part of the Chrome Extensions API. 
// (https://developer.chrome.com/docs/extensions/reference/api/storage#:~:text=The%20Storage%20API%20is%20divided,when%20the%20extension%20is%20removed.)
//-------------------------------------------------------------------------------------
// chrome.tabs.onUpdated.addListener() doesn't look like a traditional API call 
// to a remote server using something like fetch() or XMLHttpRequest.
//-------------------------------------------------------------------------------------
// The key difference here is that Chrome's extension APIs are browser-provided APIs,
// not external web services you need to connect to over the internet.
//-------------------------------------------------------------------------------------
// You can absolutely think of the Chrome Extension APIs as being "on the same machine"
//  as your extension's code. In fact, they are even more tightly 
// integrated – they are part of the same Chrome browser process.
//-------------------------------------------------------------------------------------
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  // if user is watching 
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      // anything after '?' is unique id of videos 
      const queryParameters = tab.url.split("?")[1];
      // URLSearchParams is an interface (built in like Date() interface in many langs) to work with url params 
      const urlParameters = new URLSearchParams(queryParameters);
      
      // this is a function to send message to a tab
      // this will send message to the content script that is running on that tab 
      chrome.tabs.sendMessage(tabId, {
        // content script will get the message paramters, anything we can add 
        type: "NEW",
        videoId: urlParameters.get("v"), // this will grab anything after 'v=' in that url (url parameter)
      });
    }
  });
  