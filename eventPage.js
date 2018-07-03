chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.isLink) {
        let data = request.link;
        chrome.storage.local.get(["start", "end"], (val) => {
            let start, end;
            if (val.start == undefined) {
                start = 1, end = 999;
            } else {
                start = val.start, end = val.end;
            }

            data = data.map((element) => {
                return { aText: element.aText, href: element.href, start, end,domain: element.domain};
            })
            
            chrome.storage.local.get("data", getData);
            function getData(values) {
                if (values.data !== undefined) {
                  let existingVal = values.data;
                existingVal = existingVal.map((el)=>el);
                existingVal = existingVal.concat(data);
                    chrome.storage.local.set({ data: existingVal },(err)=>{
                        if(err == undefined){
                            sendResponse({success: true})
                            makeNotification(data.length);
                        }
                    })
                
                } else {
                    chrome.storage.local.set({ data }, (err) => {
                        if (err == undefined) {
                            sendResponse({ success: true })
                            makeNotification(data.length);
                        }
                    })
                }
            }
            function makeNotification(linkCount){
                //get links 
                    chrome.storage.local.get("data", fun);
                let date = new Date();
                function fun(val){
                    chrome.notifications.create(date.getSeconds() + "", {
                        type: "basic",
                        iconUrl: "1.png",
                        title: `${linkCount} links has been added`,
                        message: `Totally ${val.data.length} links available!`
                    });
                }
               
            }
        });

    } else if (request.addMenu === true){
        chrome.contextMenus.removeAll();
        chrome.contextMenus.create({ id: sender.tab.id+"sample", contexts: ["link"], title:"Add single link"})
    } else if (request.updateMenu){
        chrome.contextMenus.removeAll();
        
        chrome.contextMenus.create({ id: sender.tab.id+'', contexts: ["link"], title: "Download " + request.selectedLink+" links" })
    }
  
    return true;
});
chrome.contextMenus.onClicked.addListener(handler);
function handler(option) {
    
    if (option.menuItemId.search("sample") !==-1){
        let menuId = option.menuItemId.replace("sample","");
        chrome.tabs.sendMessage(Number(menuId), { getSingleLink: true }, function (response) {
            
        });
    }else{
        chrome.tabs.sendMessage(Number(option.menuItemId), { getLink: true }, function (response) {
            
        });
    }
  
    
}
