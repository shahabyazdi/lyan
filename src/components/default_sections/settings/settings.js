import FormGroup from "../../form_group/form_group";
import Select from "lyan-ui/components/select";
import Title from "../shared/titlle";
import DateObject from "react-date-object";
import { calendars, locales } from "../../../shared/calendars_and_locales";
import { updateSettings } from "../../../redux/actions/actions";
import { connect } from "react-redux";

function Settings({ translate, settings, updateSettings }) {
  return (
    <>
      <Title name="Locale" />
      <div style={{ padding: "10px", margin: "10px", maxWidth: "800px" }}>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="Language" className="flex-1">
            <Select
              value={settings.language}
              onValueChange={(language) => updateSettings({ language })}
              className="full-width"
              options={translateOptions([
                ["English", "en"],
                ["Farsi", "fa"],
              ])}
            />
          </FormGroup>
          <FormGroup title="Digits" className="flex-1">
            <Select
              value={settings.digit}
              onValueChange={(digit) => updateSettings({ digit })}
              className="full-width"
              options={translateOptions([
                ["English", "en"],
                ["Farsi", "fa"],
                ["Arabic", "ar"],
                ["Hindi", "hi"],
              ])}
            />
          </FormGroup>
        </div>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="Direction" className="flex-1">
            <Select
              value={settings.direction}
              onValueChange={(direction) => updateSettings({ direction })}
              className="full-width"
              options={translateOptions([
                ["Left To Right", "ltr"],
                ["Right To Left", "rtl"],
              ])}
            />
          </FormGroup>
          <FormGroup title="Decimal Format" className="flex-1">
            <Select
              value={settings.decimal}
              onValueChange={(decimal) => updateSettings({ decimal })}
              className="full-width"
              options={[
                [".", "."],
                ["/", "/"],
              ]}
            />
          </FormGroup>
        </div>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="Calendar Type" className="flex-1">
            <Select
              value={settings.calendar}
              onValueChange={(calendar) => updateSettings({ calendar })}
              className="full-width"
              options={translateOptions([
                ["Gregorian", "gregorian"],
                ["Solar Hijri", "persian"],
                ["Hijri", "arabic"],
                ["Indian", "indian"],
              ])}
            />
          </FormGroup>
          <FormGroup title="First Day Of Week" className="flex-1">
            <Select
              value={settings.weekStartDayIndex}
              onValueChange={(value) =>
                updateSettings({ weekStartDayIndex: Number(value) })
              }
              className="full-width"
              options={new DateObject({
                calendar: calendars[settings.calendar],
                locale: locales[`${settings.calendar}_${settings.language}`],
              }).weekDays.map((weekDay) => [weekDay.name, weekDay.index])}
            />
          </FormGroup>
        </div>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="Date Format" className="flex-1">
            <Select
              value={settings.dateFormat}
              onValueChange={(dateFormat) => updateSettings({ dateFormat })}
              className="full-width"
              options={[
                ["MM/DD/YYYY", "MM/DD/YYYY"],
                ["YYYY/MM/DD", "YYYY/MM/DD"],
                ["MMM/DD/YYYY", "MMM/DD/YYYY"],
                ["YYYY/MMM/DD", "YYYY/MMM/DD"],
              ]}
            />
          </FormGroup>
          <FormGroup title="Time Format" className="flex-1">
            <Select
              value={settings.timeFormat}
              onValueChange={(timeFormat) => updateSettings({ timeFormat })}
              className="full-width"
              options={[
                ["hh:mm:ss a", "hh:mm:ss a"],
                ["hh:mm:ss A", "hh:mm:ss A"],
                ["hh:mm a", "hh:mm a"],
                ["hh:mm A", "hh:mm A"],
                ["HH:mm:ss", "HH:mm:ss"],
                ["HH:mm", "HH:mm"],
              ]}
            />
          </FormGroup>
        </div>
      </div>
      <Title name="Theme" />
      <div style={{ padding: "10px", margin: "10px", maxWidth: "800px" }}>
        <div className="display-flex margin-bottom-10">
          <FormGroup title="Calendar Color" className="flex-1">
            <Select
              value={settings.calendarColor}
              onValueChange={(calendarColor) =>
                updateSettings({ calendarColor })
              }
              className="full-width"
              options={translateOptions([
                ["Default", "default"],
                ["Red", "red"],
                ["Green", "green"],
                ["Teal", "teal"],
                ["Yellow", "yellow"],
                ["Purple", "purple"],
              ])}
            />
          </FormGroup>
          <FormGroup title="Calendar Background Color" className="flex-1">
            <Select
              value={settings.calendarBackground}
              onValueChange={(calendarBackground) =>
                updateSettings({ calendarBackground })
              }
              className="full-width"
              options={translateOptions([
                ["Default", "default"],
                ["Dark", "bg-dark"],
                ["Gray", "bg-gray"],
                ["Brown", "bg-brown"],
              ])}
            />
          </FormGroup>
        </div>
      </div>
    </>
  );

  function translateOptions(options) {
    return options.map(([text, value]) => [translate(text), value]);
  }
}

const mapStateToProps = ({ translate, settings }) => ({
  translate,
  settings,
});

const mapDispatchToProps = {
  updateSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
