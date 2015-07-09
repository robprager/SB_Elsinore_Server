package com.sb.elsinore.html;

import java.io.IOException;
import java.net.URLDecoder;

import org.rendersnake.HtmlCanvas;
import org.rendersnake.Renderable;

import static org.rendersnake.HtmlAttributesFactory.*;

import com.sb.elsinore.BrewServer;
import com.sb.elsinore.LaunchControl;
import com.sb.elsinore.Messages;

public class PIDComponent implements Renderable {

    private String probe = null;
    private String name = null;

    public PIDComponent(String name, String probe) {
        this.name = name;
        this.probe = probe;
    }

    @Override
    public void renderOn(HtmlCanvas html) throws IOException {
        if (this.probe == null) {
            BrewServer.LOG.warning("NO probe set in PID Component!");
            return;
        }

        html.div(
                id(probe).class_(
                        "col-md-2 holo-content controller panel panel-primary pid"))
                .script()
                .write(TempComponent.getGaugeScript(probe), false)
                ._script()
                .div(id(probe + "-title").class_("title panel-heading").onClick(
                        "editDevice(this);"))
                        .write(URLDecoder.decode(name))
                ._div()
                .div(id(probe + "-error").class_("btn-warning").onClick(
                        "dismissError(this)"))
                ._div()
                .div(id(probe + "-body").class_("panel-body"))
                .canvas(id(probe + "-tempGauge").class_("gauge size-2"))._canvas().div(id(probe + "-tempSummary"))
                .write(Messages.TEMPERATURE + "(").div(id("tempUnit"))
                .write("F")._div().write("): ").div(id(probe + "-tempStatus"))
                .write("temp")._div().write("&#176", false).div(id("tempUnit"))
                .write("F")._div()._div();

        if (LaunchControl.recorderEnabled()) {
            html.div(
                id(probe + "-graph_wrapper").class_(
                    "holo-content controller panel panel-info"))
            .div(id(probe + "-graph_title")
                    .class_("title panel-heading")
                    .onClick("embedGraph('" + probe + "');"
                                    + " toggleBlock('" + probe
                                    + "-graph_body');"))
                .write(Messages.SHOW_GRAPH)
            ._div()
            .div(id(probe + "-graph_body").style("padding: 0px")
                    .onClick("showGraph(this);")
                    .class_("panel-body"))
            ._div()
        ._div();
        }
        html.div()
                .div(id(probe + "-controls").class_("controller"))
                .div(id(probe + "-gage").class_("gage"))
                ._div()
                .form(id(probe + "-form").class_("controlPanelForm"))
                .input(type("hidden").name("mode").id("mode"))
                .input(type("hidden").name("deviceaddr").id("deviceaddr"))
                .input(type("hidden").name("heatgpio").id("heatgpio"))
                .input(type("hidden").name("coolgpio").id("coolgpio"))
                .input(type("hidden").name("heatinvert").id("heatinvert"))
                .input(type("hidden").name("coolinvert").id("coolinvert"))
                .input(type("hidden").name("auxgpio").id("auxgpio"))
                .input(type("hidden").name("cutoff").id("cutoff"))
                .input(type("hidden").name("calibration").id("calibration"))
                .input(type("hidden").name("hidden").id("hidden"))
                .input(type("hidden").name("vol_ain").id("vol_ain"))
                .input(type("hidden").name("vol_add").id("vol_add"))
                .input(type("hidden").name("vol_off").id("vol_off"))
                .input(type("hidden").name("vol_units").id("vol_units"))
                .div(class_("holo-buttons").class_("controlPanelForm").style("display: table"))
                .div(style("display: table-row"))
                    .render(new ModeButton(probe, "Auto", Messages.AUTO))
                    .render(new ModeButton(probe, "Hysteria", Messages.HYSTERIA))
                ._div()
                .div(style("display: table-row"))
                    .render(new ModeButton(probe, "Manual", Messages.MANUAL))
                    .render(new ModeButton(probe, "Off", Messages.PID_OFF))
                ._div()
                ._div()
                .table(id("pidInput").class_("labels table"))
                .tr(id(probe + "-SP").class_("holo-field"))
                .td(id(probe + "-labelSP"))
                .write(Messages.SET_POINT)
                ._td()
                .td(id(probe + "-setpoint"))
                .input(class_("inputBox setpoint").type("number").add("step", "any")
                        .name("setpoint").value(""))
                ._td()
                .td(id(probe + "-unitSP"))
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-DC").class_("holo-field"))
                .td(id(probe + "-labelDC"))
                .write(Messages.DUTY_CYCLE)
                ._td()
                .td(id(probe + "-dutycycle"))
                .input(class_("inputBox dutycycle").type("number").add("step", "any")
                        .name("dutycycle").value(""))
                ._td()
                .td(id(probe + "-unitDC"))
                .write("%")
                ._td()
                ._tr()
                .tr(id(probe + "-DT").class_("holo-field"))
                .td(id(probe + "-labelDT"))
                .write(Messages.DUTY_TIME)
                ._td()
                .td(id(probe + "-cycletime"))
                .input(class_("inputBox dutytime").type("number").add("step", "any")
                        .name("cycletime").maxlength("6").size("6").value(""))
                ._td()
                .td(id(probe + "-unitDT"))
                .write(Messages.SECS)
                ._td()
                ._tr()
                .write("<!-- Nav tabs -->", false)
                .tr(id(probe + "-tabbedInputs"))
                .td(colspan("3"))
                .ul(id("inputtabs").class_("nav nav-tabs").role("tablist"))
                .li(class_("active"))
                .a(href("#"+probe+"-heat").role("tab").add("data-toggle", "tab"))
                .content(Messages.HEAT)
                ._li()
                .li()
                .a(href("#"+probe+"-cool").role("tab").add("data-toggle", "tab"))
                .content(Messages.COOL)
                ._li()
                ._ul()
                .div(class_("tab-content"))
                .div(class_("tab-pane active").id(probe+"-heat"))
                .table()
                .tr(id(probe + "-heatDT").class_("holo-field"))
                .td(id(probe + "-labelDT"))
                .write(Messages.DUTY_TIME)
                ._td()
                .td(id(probe + "-cycleTime"))
                .input(class_("inputBox heatdutytime").name("heatcycletime")
                        .type("number").add("step", "any").value(""))
                ._td()
                .td(id(probe + "-unitDT"))
                .write(Messages.SECS)
                ._td()
                ._tr()
                .tr(id(probe + "-heatP").class_("holo-field"))
                .td(id(probe + "-labelp"))
                .write("P")
                ._td()
                .td(id(probe + "-pinput"))
                .input(class_("inputBox heatp").name("heatp")
                        .type("number").add("step", "any").value(""))
                ._td()
                .td(id(probe + "-unitP"))
                .write(Messages.SECS + "/&#176", false)
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-heatI").class_("holo-field"))
                .td(id(probe + "-labeli"))
                .write("I")
                ._td()
                .td(id(probe + "-iinput"))
                .input(class_("inputBox heati").name("heati")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitI"))
                .write(Messages.SECS + "&#176", false)
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-heatD").class_("holo-field"))
                .td(id(probe + "-labeld"))
                .write("D")
                ._td()
                .td(id(probe + "-dinput"))
                .input(class_("inputBox heatd").name("heatd")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitD"))
                .write(Messages.SECS)
                ._td()
                ._tr()
                ._table()
                ._div()
                .div(class_("tab-pane").id(probe+"-cool"))
                .table()
                .tr(id(probe + "-coolDT").class_("holo-field"))
                .td(id(probe + "-labelDT"))
                .write(Messages.DUTY_TIME)
                ._td()
                .td(id(probe + "-cycleTime"))
                .input(class_("inputBox cooldutytime").name("coolcycletime")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitDT"))
                .write(Messages.SECS)
                ._td()
                ._tr()
                .tr(id(probe + "-coolP").class_("holo-field"))
                .td(id(probe + "-labelp"))
                .write("P")
                ._td()
                .td(id(probe + "-pinput"))
                .input(class_("inputBox coolp").name("coolp")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitP"))
                .write(Messages.SECS + "/&#176", false)
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-coolI").class_("holo-field"))
                .td(id(probe + "-labeli"))
                .write("I")
                ._td()
                .td(id(probe + "-iinput"))
                .input(class_("inputBox cooli").name("cooli")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitI"))
                .write(Messages.SECS + "&#176", false)
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-coolD").class_("holo-field"))
                .td(id(probe + "-labeld"))
                .write("D")
                ._td()
                .td(id(probe + "-dinput"))
                .input(class_("inputBox coold").name("coold")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitD"))
                .write(Messages.SECS)
                ._td()
                ._tr()
                .tr(id(probe + "-coolDelay").class_("holo-field"))
                .td(id(probe + "-labeldelay"))
                .write(Messages.DELAY)
                ._td()
                .td(id(probe + "-delayinput"))
                .input(class_("inputBox cooldelay").name("cooldelay")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "-unitDelay"))
                .write(Messages.MINUTES)
                ._td()
                ._tr()
                ._table()
                ._div()
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-min").class_("holo-field"))
                .td(id(probe + "-labelMin"))
                .write(Messages.MIN)
                ._td()
                .td(id(probe + "-mininput"))
                .input(class_("inputbox min").name("min")
                        .type("number").add("step", "any")
                        .value("6"))
                ._td()
                .td(id(probe + "unitMin"))
                .write("&#176", false)
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-max").class_("holo-field"))
                .td(id(probe + "-labelMax"))
                .write(Messages.MAX)
                ._td()
                .td(id(probe + "-maxinput"))
                .input(class_("inputbox miax").name("max")
                        .type("number").add("step", "any")
                        .value(6))
                ._td()
                .td(id(probe + "unitMax"))
                .write("&#176", false)
                .div(id("tempUnit"))
                .write("F")
                ._div()
                ._td()
                ._tr()
                .tr(id(probe + "-time").class_("holo-field"))
                .td(id(probe + "-labelTime"))
                .write(Messages.TIME)
                ._td()
                .td(id(probe + "-timeinput"))
                .input(class_("inputbox time").name("time")
                        .type("number").add("step", "any")
                        .value(""))
                ._td()
                .td(id(probe + "unitTime"))
                .write(Messages.MINUTES)
                ._td()
                ._tr()
                ._table()
                .div(class_("holo-buttons"))
                .button(id(probe + "Aux").class_("btn switch").onClick(
                        "toggleAux('" + probe + "'),"
                                + " waitForMsg(); return false;"))
                .write(Messages.AUX_ON)
                ._button()
                .br()
                .button(id("sendcommand").class_("btn switch")
                        .type("submit")
                        .value("SubmitCommand")
                        .onClick(
                                "submitForm(this.form); waitForMsg();"
                                        + " return false"))
                .write(Messages.SEND_COMMAND)._button()._div()._form()._div()
                .div(id(probe + "-volume"))
                        .div(id(probe + "-volumeAmount"))._div()
                        .button(id(probe + "-volumeeditbutton")
                                .class_("btn switch")
                                .onClick("editVolume(this);"))
                                .write(Messages.EDIT_VOLUME)
                        ._button()
                ._div()
            ._div()
        ._div()
    ._div();
    }

}
