import { FeatureToggleContext } from "context/FeatureToggleContext";
import { useContext } from "react";

export const useFeatures = () => {
  const { features, setFeatures } = useContext(FeatureToggleContext);
  return { features, setFeatures };
};
