import "../ErrorPopup.css";

interface ErrorPopupProps {
    message: string;
    onClose: () => void;
}

function ErrorPopup({ message, onClose }: ErrorPopupProps) {
    return (
        <div className="popup-overlay">
            <div className="popup-box">
                <p className="popup-message">{message}</p>
                <button className="popup-button" onClick={onClose}>OK</button>
            </div>
        </div>
    );
}

export default ErrorPopup;