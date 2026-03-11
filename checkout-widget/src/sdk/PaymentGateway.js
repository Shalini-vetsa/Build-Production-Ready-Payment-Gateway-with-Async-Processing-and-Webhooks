import { createModal } from "./modal";
import "./styles.css";

class PG {
  constructor(options) {
    this.key = options.key;
    this.orderId = options.orderId;
    this.onSuccess = options.onSuccess || (() => {});
    this.onFailure = options.onFailure || (() => {});
    this.onClose = options.onClose || (() => {});
  }

  open() {
    const url = `/checkout-widget.html?order_id=${this.orderId}&key=${this.key}`;
    this.modal = createModal(url);
    this.pollInterval = null;
  }

  async poll(paymentId) {
    const pollRequest = async () => {
      const res = await fetch(`/api/v1/payments/${paymentId}`, {
        headers: { "X-Api-Key": this.key }
      });
      const p = await res.json();

      if (p.status === "success") {
        clearInterval(this.pollInterval);
        this.modal.close();
        this.onSuccess(p);
      }

      if (p.status === "failed") {
        clearInterval(this.pollInterval);
        this.modal.close();
        this.onFailure(p);
      }
    };

    this.pollInterval = setInterval(pollRequest, 1500);
  }

  close() {
    this.modal.close();
    this.onClose();
  }
}

export default PG;

if (typeof window !== "undefined") {
  window.PaymentGateway = PG;
  window.PaymentGatewayInstance = PG.prototype;
}
