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

/// The app's screen: one web page per tab (Home, Messages, Search, Profile).
/// Each tab keeps its page loaded, so switching tabs is instant and keeps your place,
/// like the real app. All tabs share one login.
final class TabsViewController: UIViewController, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
    private static let base = "https://www.instagram.com"
    private static let userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1"
    private static let startPaths = ["home": "/?variant=following", "messages": "/direct/inbox/", "search": "/explore/search/", "profile": "/"]
    private static let allowedHosts = ["instagram.com", "cdninstagram.com", "fbcdn.net", "facebook.com", "fbsbx.com", "facebook.net"]

    private let processPool = WKProcessPool()
    private var webViews: [String: WKWebView] = [:]
    private var currentTab = "home"
    private var scriptSource = ""
    private let statusBarBlur = UIVisualEffectView(effect: UIBlurEffect(style: .systemChromeMaterial))

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        if let url = Bundle.main.url(forResource: "inject", withExtension: "js", subdirectory: "public"),
           let source = try? String(contentsOf: url, encoding: .utf8) {
            scriptSource = source
        }
        statusBarBlur.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(statusBarBlur)
        NSLayoutConstraint.activate([
            statusBarBlur.topAnchor.constraint(equalTo: view.topAnchor),
            statusBarBlur.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            statusBarBlur.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            statusBarBlur.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
        ])
        switchTo(tab: "home", path: nil)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        if #available(iOS 26.0, *) {
            let insets = UIEdgeInsets(top: view.safeAreaInsets.top, left: 0, bottom: 0, right: 0)
            for webView in webViews.values where webView.obscuredContentInsets != insets {
                webView.obscuredContentInsets = insets
            }
        }
    }

    // MARK: Tabs

    private func switchTo(tab: String, path: String?) {
        let webView: WKWebView
        if let existing = webViews[tab] {
            webView = existing
        } else {
            webView = makeWebView(tab: tab)
            webViews[tab] = webView
            let start = (path?.isEmpty == false ? path! : Self.startPaths[tab]) ?? "/"
            if let url = URL(string: Self.base + start) {
                webView.load(URLRequest(url: url))
            }
            view.setNeedsLayout()
        }
        currentTab = tab
        for (name, other) in webViews {
            other.isHidden = name != tab
        }
        view.bringSubviewToFront(statusBarBlur)
    }

    private func makeWebView(tab: String) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.processPool = processPool
        config.websiteDataStore = .default()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        let content = config.userContentController
        content.addUserScript(WKUserScript(source: "window.__instaNative = { tab: '\(tab)' };",
                                           injectionTime: .atDocumentStart, forMainFrameOnly: true))
        content.addUserScript(WKUserScript(source: scriptSource, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        content.add(WeakMessageHandler(self), name: "insta")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.customUserAgent = Self.userAgent
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsLinkPreview = false
        webView.isOpaque = false
        webView.backgroundColor = .systemBackground
        webView.scrollView.backgroundColor = .systemBackground
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.insertSubview(webView, belowSubview: statusBarBlur)

        // iOS 26+: the page runs under the status bar (blurred) while fixed bars stay below it.
        // Older iOS: the page starts below the status bar.
        let topAnchor: NSLayoutYAxisAnchor
        if #available(iOS 26.0, *) {
            topAnchor = view.topAnchor
        } else {
            topAnchor = view.safeAreaLayoutGuide.topAnchor
        }
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        return webView
    }

    // MARK: Messages from the page

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
        if action == "tab", let tab = body["tab"] as? String, Self.startPaths[tab] != nil {
            switchTo(tab: tab, path: body["path"] as? String)
        }
    }

    // MARK: Navigation

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.allow); return }
        if navigationAction.targetFrame?.isMainFrame == false { decisionHandler(.allow); return }
        let scheme = url.scheme?.lowercased() ?? ""
        if scheme == "about" || scheme == "blob" || scheme == "data" { decisionHandler(.allow); return }
        let host = url.host?.lowercased() ?? ""
        if (scheme == "https" || scheme == "http"),
           Self.allowedHosts.contains(where: { host == $0 || host.hasSuffix("." + $0) }) {
            decisionHandler(.allow)
            return
        }
        // Everything else (outside links, app links) opens outside Insta.
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        // Links meant for a new window open in the same tab.
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        webView.reload()
    }

    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                 initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                 decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.prompt)
    }
}

/// Avoids a retain cycle between the web view's content controller and the screen.
final class WeakMessageHandler: NSObject, WKScriptMessageHandler {
    private weak var target: WKScriptMessageHandler?
    init(_ target: WKScriptMessageHandler) { self.target = target }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}
