import { ios } from "tns-core-modules/utils/utils";
import { Frame } from "tns-core-modules/ui";

function share(thingsToShare) {
  return new Promise((resolve, reject) => {
    const activityController = UIActivityViewController.alloc()
        .initWithActivityItemsApplicationActivities(thingsToShare, null);

    activityController.completionWithItemsHandler = (type: string, shared: boolean, returnedItems: NSArray<any>, error: NSError) => {
      if (error)
        reject(error.localizedDescription)
      
      resolve(shared)
    }

    const presentViewController = activityController.popoverPresentationController;
    if (presentViewController) {
      const page = Frame.topmost().currentPage;
      if (page && page.ios.navigationItem.rightBarButtonItems &&
        page.ios.navigationItem.rightBarButtonItems.count > 0) {
        presentViewController.barButtonItem = page.ios.navigationItem.rightBarButtonItems[0];
      } else {
        presentViewController.sourceView = page.ios.view;
      }
    }

    const app = UIApplication.sharedApplication;
    const window = app.keyWindow || (app.windows && app.windows.count > 0 && app.windows[0]);
    const rootController = window.rootViewController;

    ios.getVisibleViewController(rootController)
      .presentViewControllerAnimatedCompletion(activityController, true, null);
  })
}

export async function shareImage(image) {
  return await share([image]);
}

export async function shareText(text) {
  return await share([text]);
}

export async function shareUrl(url, text) {
  return await share([NSURL.URLWithString(url), text]);
}
