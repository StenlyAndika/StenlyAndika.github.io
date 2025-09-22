
// Date display function
        function tampilkanTanggal() {
            const opsi = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' };
            const tanggal = new Intl.DateTimeFormat('id-ID', opsi).format(new Date());
            $('#tanggal').text(tanggal);
        }

        $(document).ready(function() {
            tampilkanTanggal();
        });

        function guestBookWizard() {
            return {
                currentStep: 1,
                isSubmitting: false,
                showSuccess: false,
                cameraActive: false,
                capturedPhoto: null,
                stream: null,
                cameraError: false,
                cameraErrorMessage: '',
                form: {
                    bidang: '',
                    nama: '',
                    alamat: '',
                    nowa: '',
                    asal: '',
                    keperluan: '',
                    photo: null
                },

                init() {
                    // Date will be set by jQuery function
                },

                async startCamera() {
                    try {
                        // Check if camera is supported
                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            throw new Error('Kamera tidak didukung oleh browser Anda');
                        }

                        // Request camera permission with optimal settings for mobile
                        const constraints = {
                            video: {
                                facingMode: 'user', // Front camera by default
                                width: { ideal: 640 },
                                height: { ideal: 480 }
                            },
                            audio: false
                        };

                        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                        this.cameraActive = true;

                        // Wait for next tick to ensure video element is visible
                        this.$nextTick(() => {
                            if (this.$refs.video) {
                                this.$refs.video.srcObject = this.stream;
                            }
                        });

                    } catch (error) {
                        console.error('Camera error:', error);
                        this.handleCameraError(error);
                    }
                },

                stopCamera() {
                    if (this.stream) {
                        this.stream.getTracks().forEach(track => track.stop());
                        this.stream = null;
                    }
                    this.cameraActive = false;
                },

                capturePhoto() {
                    if (!this.$refs.video || !this.$refs.canvas) return;

                    const video = this.$refs.video;
                    const canvas = this.$refs.canvas;
                    const context = canvas.getContext('2d');

                    // Set canvas dimensions to match video
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Draw video frame to canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert to base64 image
                    this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);
                    this.form.photo = this.capturedPhoto;

                    // Stop camera after capture
                    this.stopCamera();
                },

                retakePhoto() {
                    this.capturedPhoto = null;
                    this.form.photo = null;
                    this.startCamera();
                },

                handleCameraError(error) {
                    let message = 'Terjadi kesalahan saat mengakses kamera.';

                    if (error.name === 'NotAllowedError') {
                        message = 'Izin akses kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser.';
                    } else if (error.name === 'NotFoundError') {
                        message = 'Kamera tidak ditemukan di perangkat Anda.';
                    } else if (error.name === 'NotReadableError') {
                        message = 'Kamera sedang digunakan oleh aplikasi lain.';
                    } else if (error.name === 'OverconstrainedError') {
                        message = 'Pengaturan kamera tidak didukung.';
                    }

                    this.cameraErrorMessage = message;
                    this.cameraError = true;
                },

                nextStep() {
                    if (this.currentStep === 1 && this.form.bidang) {
                        this.currentStep = 2;
                    }
                },

                previousStep() {
                    if (this.currentStep === 2) {
                        this.currentStep = 1;
                        // Stop camera when going back
                        this.stopCamera();
                    }
                },

                submitForm() {
                    if (!this.isFormValid()) return;

                    this.isSubmitting = true;

                    // Format tanggal Indonesia dd-MM-yyyy
                    const today = new Date();
                    const tgl = today.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    });

                    const entry = {
                        tgl: tgl,
                        bidang: this.form.bidang,
                        nama: this.form.nama,
                        nowa: this.form.nowa,
                        alamat: this.form.alamat,
                        asal: this.form.asal,
                        keperluan: this.form.keperluan,
                        photo: this.form.photo, // Include the captured photo
                        status: "waiting"
                    };

                    const customId = crypto.randomUUID();

                    fetch(`https://guest-book-a50a5-default-rtdb.asia-southeast1.firebasedatabase.app/guestBook/${customId}.json`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(entry)
                    })
                    .then(res => {
                        if (!res.ok) throw new Error("Failed to save");
                        return res.json();
                    })
                    .then(data => {
                        this.isSubmitting = false;
                        this.showSuccess = true;
                        this.stopCamera();
                    })
                    .catch(err => {
                        console.error("Error:", err);
                        this.isSubmitting = false;
                        // You could show an error message here
                        alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
                    });
                },

                isFormValid() {
                    return this.form.nama &&
                           this.form.alamat &&
                           this.form.nowa &&
                           this.form.asal &&
                           this.form.keperluan &&
                           this.capturedPhoto;
                },

                resetForm() {
                    this.currentStep = 1;
                    this.capturedPhoto = null;
                    this.stopCamera();
                    this.form = {
                        bidang: '',
                        nama: '',
                        alamat: '',
                        nowa: '',
                        asal: '',
                        keperluan: '',
                        photo: null
                    };
                }
            }
        }
