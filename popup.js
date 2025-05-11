// this is the UI of the pop when you open the extension and see on top 
import { getActiveTabURL } from "./utils";

// this event is a native event that happens when the html is first loaded 
document.addEventListener("DOMContentLoaded", async () => {
    console.log("loaded");
    // check what tab it is where the html is loaded
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split('?')[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    // if user is on youtbe and watching a video
    if (activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo], (data) => {
          const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
          viewBookmarks(currentVideoBookmarks);
    });
    }
    else {
        // inspect the pop html, you will see it is inside a docmument with class called container, so just get that 
        const container = document.getElementsByClassName("container")[0];
        console.log(container);
        container.innerHTML = '<div class="title"> this is not yt video page.</div>';
    }
});

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  // add bookmark buttons to the contols element
  // and add an event listener to it
  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  // we give each book mark a different id based on time so we can easily delete or add them
  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  // add the title and controls to the bookmark elemet
  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks=[]) => {
  // this is what we wrote in popup html
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

// create a variable named onPlay (however the value assigned is an async funciton),
// the function is an eventlistenr that is used when play button is clicked
// e is the event object 
// the event object that is passed as an argument to the function provides information about the event that occurred,
// including a reference to the HTML element that triggered the event.
const onPlay = async e => {
  // e.target is the HTML element that directly tirggered the event
  // we take its parent elements' (controlParentElement) parent(newBookmarkElement)
  //  and look for attribute timestamp
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  // get active tab
  const activeTab = await getActiveTabURL();

  // send message to the active tab, content script can use this message to play the vid
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async e => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  // add an image to show ass button
  const controlElement = document.createElement("img");
  controlElement.src = "assets/" + src + ".png";

  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};
