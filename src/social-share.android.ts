import * as application from "tns-core-modules/application";
import * as platform from "tns-core-modules/platform";

let context;
let numberOfImagesCreated = 0;
declare var global: any;
const REQUEST_CODE = 99
const FileProviderPackageName = useAndroidX() ? global.androidx.core.content : (<any>android).support.v4.content;

function getIntent(type) {
  const intent = new android.content.Intent(android.content.Intent.ACTION_SEND);
  intent.setType(type);
  return intent;
}
function share(intent, subject) {
  return new Promise(resolve => {
    context = application.android.context;
    subject = subject || "How would you like to share this?";

    const shareIntent = android.content.Intent.createChooser(intent, subject);
    shareIntent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
    // context.startActivity(shareIntent);

    const activity = <android.app.Activity>context
    activity.onActivityResult = (requestCode: number, resultCode: number, data: android.content.Intent) => {
      if (requestCode === REQUEST_CODE)
        if (resultCode === android.app.Activity.RESULT_OK)
          resolve(true)
        else if (resultCode === android.app.Activity.RESULT_CANCELED)
          resolve(false)
    }
    activity.startActivityForResult(shareIntent, REQUEST_CODE)
  })
}
function useAndroidX () {
  return global.androidx && global.androidx.appcompat;
}

export async function shareImage(image, subject) {
  numberOfImagesCreated ++;

  context = application.android.context;

  const intent = getIntent("image/jpeg");

  const stream = new java.io.ByteArrayOutputStream();
  image.android.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, stream);

  const imageFileName = "socialsharing" + numberOfImagesCreated + ".jpg";
  const newFile = new java.io.File(context.getExternalFilesDir(null), imageFileName);

  const fos = new java.io.FileOutputStream(newFile);
  fos.write(stream.toByteArray());

  fos.flush();
  fos.close();

  let shareableFileUri;
  const sdkVersionInt = parseInt(platform.device.sdkVersion);
  if (sdkVersionInt >= 21) {
    shareableFileUri = FileProviderPackageName.FileProvider.getUriForFile(context, application.android.nativeApp.getPackageName() + ".provider", newFile);
  } else {
    shareableFileUri = android.net.Uri.fromFile(newFile);
  }
  intent.putExtra(android.content.Intent.EXTRA_STREAM, shareableFileUri);

  return await share(intent, subject);
}

export async function shareText(text, subject) {
  const intent = getIntent("text/plain");

  intent.putExtra(android.content.Intent.EXTRA_TEXT, text);
  return await share(intent, subject);
}

export async function shareUrl(url, text, subject) {
  const intent = getIntent("text/plain");

  intent.putExtra(android.content.Intent.EXTRA_TEXT, url);
  intent.putExtra(android.content.Intent.EXTRA_SUBJECT, text);

  return await share(intent, subject);
}
