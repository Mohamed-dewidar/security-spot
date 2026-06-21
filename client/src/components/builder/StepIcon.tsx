import cameraIcon from "@/assets/icons/steps/camera.svg";
import extraIcon from "@/assets/icons/steps/extra.svg";
import planIcon from "@/assets/icons/steps/plan.svg";
import sensorsIcon from "@/assets/icons/steps/sensors.svg";
import type { StepIconId } from "@/types/catalog";

type StepIconProps = {
  icon: StepIconId;
  className?: string;
};

const iconSrc: Record<StepIconId, string> = {
  camera: cameraIcon,
  plan: planIcon,
  sensors: sensorsIcon,
  extra: extraIcon,
};

export function StepIcon({ icon, className = "size-[30px]" }: StepIconProps) {
  return (
    <img
      src={iconSrc[icon]}
      alt=""
      aria-hidden="true"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
