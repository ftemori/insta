import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

/// The app's screen: Capacitor's web view plus the Insta focus script.
class MainViewController: CAPBridgeViewController {
    private var injectSource: String?
    private var reinjectTimer: Timer?

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        guard
            let url = Bundle.main.url(forResource: "inject", withExtension: "js", subdirectory: "public"),
            let source = try? String(contentsOf: url, encoding: .utf8)
        else {
            CAPLog.print("Insta: public/inject.js is missing")
            return
        }
        injectSource = source
        let script = WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        webView?.configuration.userContentController.addUserScript(script)

        // Feel like an app, not a browser.
        webView?.allowsBackForwardNavigationGestures = true
        webView?.allowsLinkPreview = false
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
        webView?.scrollView.bounces = true
        webView?.isOpaque = false
        webView?.backgroundColor = .systemBackground
        webView?.scrollView.backgroundColor = .systemBackground
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Safety net: if a page ever loads without the script, add it.
        // The script ignores repeat runs, so this is cheap.
        reinjectTimer?.invalidate()
        reinjectTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self, let source = self.injectSource, let webView = self.webView else { return }
            guard webView.url?.host?.hasSuffix("instagram.com") == true else { return }
            webView.evaluateJavaScript("window.__instaFocus === true") { result, _ in
                if (result as? Bool) != true {
                    webView.evaluateJavaScript(source, completionHandler: nil)
                }
            }
        }
    }
}
