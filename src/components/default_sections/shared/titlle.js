import { useSelector } from "react-redux";
import "./title.scss";

export default function Title({ name }) {
  const translate = useSelector((state) => state.translate);

  return <div className="title">{translate(name)}</div>;
}
