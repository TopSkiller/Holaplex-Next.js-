import { FC } from 'react';

interface ExplorerIconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const ExplorerIcon: FC<ExplorerIconProps> = ({ width = 24, height = 20, className }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 24 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23.8764 15.7686L19.9145 19.7276C19.8284 19.8136 19.7241 19.8822 19.6083 19.929C19.4925 19.9759 19.3676 20.0001 19.2414 20H0.459951C0.370334 20 0.28267 19.9756 0.207731 19.9298C0.132791 19.884 0.0738392 19.8188 0.0381186 19.7423C0.00239817 19.6657 -0.00853499 19.581 0.00666254 19.4988C0.02186 19.4165 0.0625261 19.3401 0.123665 19.279L4.08858 15.32C4.17448 15.2342 4.27834 15.1658 4.39376 15.119C4.50919 15.0721 4.63371 15.0478 4.75962 15.0476H23.54C23.6296 15.0476 23.7173 15.072 23.7923 15.1178C23.8672 15.1636 23.9261 15.2288 23.962 15.3054C23.9976 15.382 24.0085 15.4666 23.9933 15.5489C23.9781 15.6312 23.9375 15.7075 23.8764 15.7686ZM19.9145 7.79618C19.8284 7.71018 19.7241 7.64161 19.6083 7.59475C19.4925 7.54791 19.3676 7.52375 19.2414 7.52382H0.459951C0.370334 7.52382 0.28267 7.5482 0.207731 7.594C0.132791 7.6398 0.0738392 7.70498 0.0381186 7.78155C0.00239817 7.85814 -0.00853499 7.94277 0.00666254 8.02507C0.02186 8.10734 0.0625261 8.18371 0.123665 8.24477L4.08858 12.2038C4.17448 12.2896 4.27834 12.358 4.39376 12.4049C4.50919 12.4517 4.63371 12.476 4.75962 12.4762H23.54C23.6296 12.4762 23.7173 12.4518 23.7923 12.406C23.8672 12.3602 23.9261 12.295 23.962 12.2185C23.9976 12.1419 24.0085 12.0572 23.9933 11.9749C23.9781 11.8927 23.9375 11.8163 23.8764 11.7552L19.9145 7.79618ZM0.459951 4.95239H19.2414C19.3676 4.95243 19.4925 4.9283 19.6083 4.88143C19.7241 4.83457 19.8284 4.766 19.9145 4.68L23.8764 0.720952C23.9375 0.659902 23.9781 0.583541 23.9933 0.50125C24.0085 0.418959 23.9976 0.334325 23.962 0.257745C23.9261 0.181166 23.8672 0.115976 23.7923 0.070187C23.7173 0.0243975 23.6296 2.81986e-06 23.54 0H4.75962C4.63371 0.000199636 4.50919 0.024477 4.39376 0.0713291C4.27834 0.118181 4.17448 0.186611 4.08858 0.272382L0.124687 4.23143C0.0636073 4.29241 0.0229591 4.3687 0.00772716 4.45089C-0.00750484 4.53309 0.00334156 4.61766 0.038936 4.6942C0.0745306 4.77075 0.133326 4.83593 0.208112 4.8818C0.282898 4.92766 0.370422 4.95218 0.459951 4.95239Z"
      fill="currentColor"
    />
  </svg>
);
