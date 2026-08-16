import Swal from "sweetalert2";

const alertTheme = {
    background: "#17111f",
    color: "#fbf8ff",
    buttonsStyling: false,
    customClass: {
        popup: "vibfy-swal",
        title: "vibfy-swal-title",
        htmlContainer: "vibfy-swal-copy",
        actions: "vibfy-swal-actions",
        confirmButton: "vibfy-swal-confirm",
        icon: "vibfy-swal-icon",
    },
};

export const showSuccessToast = (title, message) =>
    Swal.fire({
        ...alertTheme,
        toast: true,
        position: "top-end",
        icon: "success",
        title,
        text: message,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        customClass: {
            ...alertTheme.customClass,
            popup: "vibfy-swal vibfy-toast",
        },
    });

export const showFailureAlert = (message) =>
    Swal.fire({
        ...alertTheme,
        icon: "error",
        title: "We couldn't save that",
        text: message,
        confirmButtonText: "Try again",
    });
