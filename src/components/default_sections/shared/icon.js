import "./icon.scss";

export default function Icon({ icon, name, onClick }) {
  return (
    <div className="icon-container" onClick={onClick}>
      <div className="icon">{icon}</div>
      <div className="name">{name}</div>
    </div>
  );
}
