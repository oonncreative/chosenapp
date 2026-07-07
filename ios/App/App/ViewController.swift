import UIKit
import Capacitor
import WebKit

class ViewController: CAPBridgeViewController, WKNavigationDelegate {

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        let webView = WKWebView(frame: frame, configuration: configuration)
        return webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        self.webView?.navigationDelegate = self
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showOfflineScreen()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showOfflineScreen()
    }

    private func showOfflineScreen() {
        guard let offlineURL = Bundle.main.url(forResource: "offline", withExtension: "html") else {
            return
        }
        webView?.loadFileURL(offlineURL, allowingReadAccessTo: offlineURL.deletingLastPathComponent())
    }
}
