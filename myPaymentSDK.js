(function () {
    window.MyPaymentSDK = {
        config: {},
        popup: null,

        init: function (config) {
            this.config = {
                apiKey: config.apiKey || '',
                payfamCode: config.payfamCode || '', // Custom header
                accountName: config.accountName || '',
                amount: config.amount || 0,
                email: config.email || '',
                metadata: config.metadata || {},
                callbackurl: config.callbackurl || '',
                webhookurl: config.webhookurl || '',
                apiUrl: 'https://payfam.com.ng/api/initiate-transaction/',
                popupWidth: config.popupWidth || 500,
                popupHeight: config.popupHeight || 400,
                onSuccess: config.onSuccess || null,
                onError: config.onError || null
            };
        },

        open: async function () {
            if (!this.config.apiKey || !this.config.payfamCode || !this.config.accountName || !this.config.amount || !this.config.email) {
                const errorMsg = 'Missing required fields: apiKey, payfamCode, accountName, amount, and email are required';
                if (this.config.onError) {
                    this.config.onError(errorMsg);
                }
                console.error(errorMsg);
                return;
            }

            try {
                const response = await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.config.apiKey, // Send as api-key header
                        'payfam-code': this.config.payfamCode // Custom header
                    },
                    body: JSON.stringify({
                        accountName: this.config.accountName,
                        amount: this.config.amount,
                        email: this.config.email,
                        metadata: this.config.metadata,
                        callbackurl: this.config.callbackurl,
                        webhookurl: this.config.webhookurl
                    })
                });

                const data = await response.json();

                if (response.ok && data.code === '200' && data.data.status === 'success') {
                    // Open payment link from nested data object
                    this.popup = window.open(
                        data.data.paymentLink,
                        'PaymentPopup',
                        `width=${this.config.popupWidth},height=${this.config.popupHeight}`
                    );
                    if (!this.popup) {
                        console.error('Popup blocked. Redirecting to payment link.');
                        window.location.href = data.data.paymentLink;
                        if (this.config.onError) {
                            this.config.onError('Popup blocked');
                        }
                        return;
                    }
                    if (this.config.onSuccess) {
                        this.config.onSuccess(data.data);
                    }
                } else {
                    const errorMsg = data.message || 'Initialization failed';
                    if (this.config.onError) {
                        this.config.onError(errorMsg);
                    }
                    console.error('Error:', errorMsg);
                }
            } catch (error) {
                if (this.config.onError) {
                    this.config.onError(error.message);
                }
                console.error('Error:', error.message);
            }
        },

        closePopup: function () {
            if (this.popup && !this.popup.closed) {
                this.popup.close();
                this.popup = null;
            }
        }
    };
})();
