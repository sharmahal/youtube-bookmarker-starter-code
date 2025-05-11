/* 
The code is wrapped in an Immediately Invoked Function Expression (IIFE):

JavaScript

(() => {
  // ... code ...
})();
This creates a private scope, preventing variables declared within it from polluting the global namespace.
*/
(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    // fetch all the bookmarks present 
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj)=>{
                resolve(obj[currentVideo]? JSON.parse(obj[currentVideo]): []);
            });
        });
    }

    const addNewBookmarkEventHandler = () => {
        const currentTime = youtubePlayer.currentTime; // this tag contains a currentTime field
        console.log("Current time in vid:", currentTime)
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log(newBookmark);
        
        // use chrome storage to sync it
         chrome.storage.sync.set({
            // use json stringify as chrome storage accepts json
            // [... currentVideoBookmarks] spreads the array of it, and we add newBookMark to it
            // this looks like a key value pair
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }

    // create a listener to the messages 
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        // extract the three fields from the obj
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type == "PLAY"){
            youtubePlayer.currentTime = value
        }
    });

    // function to inject bookmark button to any of the pages 
    const newVideoLoaded = async () => {
        console.log("here");
        console.log("new video:", currentVideo);
        //get the document that has class name bookmark-btn (first one), if it exists
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log(bookmarkBtnExists, "this is the book mark");

        // get current bookmarks present in this video 
        currentVideoBookmarks = await fetchBookmarks();

        if (!bookmarkBtnExists) {
            // create <img> element of html
            const bookmarkBtn = document.createElement("img");
            // src is an attribute of img class in html as we know 
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            // get the left side youtube controls using the classname (exists if you check the yt html in inspect element)
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            // get video steam element 
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            // FYI, if you write document.getElementsByClassName("video-stream")[0] on conosole in the insepct element,
            // it will be printed
            youtubeLeftControls.appendChild(bookmarkBtn); // add the button to its html
            // create an event listener to listen for a click on the document 
            // Note - addEventListener is a property of documents in JS, used to attatch a handler to some change in a document
            // addListener we saw previusly is just a method of chrom APIs
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }
    // any time page loads (the impl is a bit hacky, so if it does not make sense somewhere, could be because of that)
    newVideoLoaded();
})();

// convert seconds to standard time shown in yt
const getTime = t => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substr(11, 0);
}
