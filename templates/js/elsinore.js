String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function parseVessels(vessels)
{
    $.each(vessels, function (vesselProbe, vesselStatus)
    {
        var probeCard = $("#probes  #" + vesselStatus.deviceaddr);
        if (probeCard.eq(0).size() == 0)
        {
            probeCard = addProbeCard(vesselStatus.deviceaddr, vesselStatus.tempprobe.position);
        }
        // Set card name
        setCardName(probeCard, vesselStatus.name);
        loadTempProbeData(probeCard, vesselStatus.tempprobe);
        if ("pidstatus" in vesselStatus)
        {
            loadPIDData(probeCard, vesselStatus.pidstatus);
        }
    });
}

function parseData(data)
{
    if ("vessels" in data)
    {
        parseVessels(data.vessels);
    }
}

function requestData()
{
    $.ajax({
        type: 'GET',
        url: '/getstatus',
        dataType: 'json',
        async: true,
        cache: false,
        timeout: 5000,
        success: parseData
        }
    );
}

function addProbeCard(vesselProbe, position)
{
    var div = "<div id='" + vesselProbe 
    + "' class='col-sm-12 col-md-6 col-lg-5 col-xl-3 card card-block text-center'>"
        + "</div>";
    $("#probes > #card-deck").append(div);
    return $("#probes #" + vesselProbe);
}

function setCardName(card, name)
{
    var title = card.find(".card-header");
    if (title.size() == 0)
    {
        card.prepend("<div class='card-header'></div>");
        title = card.find(".card-header");
    }

    if (title.text() != name)
    {
        title.text(name);
    }
}

function loadTempProbeData(card, tempprobe)
{
    card.data("temp", tempprobe);
    var value = card.find("#value");
    if (value.size() == 0)
    {
        card.append("<p class='temperature' ><span id='value'></span><span id='units'></span></div>");
        value = card.find("#value");
    }
    units = card.find("#units");
    value.html(tempprobe.temp.toFixed(2));
    units.html("&#176" + tempprobe.scale);

    if (tempprobe.hidden) 
    {
        if (card.is(":visible"))
        {
            card.hide();
        }
    }
    else 
    {
        if (card.is(":hidden"))
        {
            card.show();
        }
    }

}

function loadPIDData(card, pid)
{
    card.data("pid", pid);
    var pidmode = card.find("#mode");
    if (pidmode.size() == 0)
    {
        card.append("<div id='mode' class='btn-group'>"
            + "<button type='button' onclick='toggleMode(this)' class='btn' id='off'>Off</button>"
            + "<button type='button' onclick='toggleMode(this)' class='btn' id='auto'>Auto</button>"
            + "<button type='button' onclick='toggleMode(this)' class='btn' id='manual'>Manual</button>"
            + "<button type='button' onclick='toggleMode(this)' class='btn' id='hysteria'>Hysteria</button>"
            + "</div>");
        pidmode = card.find("#mode");
    }
    var selected = pidmode.find(".btn-danger");
    if (selected.size() == 1 && selected.id != pid.mode)
    {
       selected.removeClass("btn-danger");
    }
    selected = pidmode.find("#" + pid.mode);
    if (!selected.hasClass("btn-danger active"))
    {
        selected.addClass("btn-danger active");
    }

}

function toggleMode(button)
{
    console.log(button);
    var card = $(getCard(button));
    if(!card.find("#mode > .active").hasClass("btn-danger"))
    {
        card.find("#mode > .active").addClass("btn-danger");
    }
    if (card.find("#mode > .btn-success").size() == 1)
    {
        card.find("#mode > .btn-success").removeClass('btn-success');
    }
    if ($(button).hasClass('btn-success'))
    {
        return;
    }
    $(button).removeClass('btn-success btn-danger');
    $(button).addClass('btn-success');
    var device = card.id;
    var mode = button.id;
    switch(mode) {
        case "off":
            console.log("Off");
            showOff(card);
            break;
        case "auto":
            console.log("Auto");
            showAuto(card);
            break;
        case "manual":
            console.log("Manual");
            showManual(card);
            break;
        case "hysteria":
            console.log("Hysteria");
            showHysteria(card);
            break;
    }
}

function getCard(element)
{
    var card = $(element).closest('.card');
    if (card.size() == 1)
    {
        return card[0];
    }
    return null;
}

function showOff(card)
{
    card = $(card);
    pidsettings = card.find("#pidsettings");
    if (pidsettings.size() == 0)
    {
        card.append("<div id='pidsettings'></div>");
        pidsettings = card.find('#pidsettings');
    }
    pidsettings.empty();
    pidsettings.append("<div class='form-group form-inline row'><button type='button' class='btn btn-danger' id='submit' onclick='submitForm(this);'>Submit</button></div>");
}

function showAuto(card)
{
    card = $(card);
    var pidsettings = card.find('#pidsettings');
    var piddata = card.data("pid");
    var tempdata = card.data("temp");
    if (pidsettings.size() == 0)
    {
        card.append("<div id='pidsettings'></div>");
        pidsettings = card.find('#pidsettings');
    }

    // Make sure we clear out the settings form
    pidsettings.empty();
    pidsettings.append("<form></form>");
    var form = pidsettings.find("form");
    form.append("<div class='form-group form-inline row'><label for='setpoint_input' class='form-control-label col-sm-4'>Set Point</label><div class='col-sm-6'><input type='number' class='form-control' id='setpoint_input' placeholder='Set Point'/></div><label class='form-control-label col-sm-2' for='setpoint_input'>&#176" + tempdata.scale + "</label></div>");
    if ("heat" in piddata && piddata.heat.gpio != "")
    {
        appendSettings(form, "heat", piddata, tempdata.scale);
    }
    if ("cool" in piddata && piddata.cool.gpio != "")
    {
        appendSettings(form, "cool", piddata, tempdata.scale);
    }

    form.find("#setpoint_input").val(piddata.setpoint);
    // Set the first tab to active
    form.find(".nav a:first").tab("show");
    form.append("<div class='form-group form-inline row'><button type='button' class='btn btn-danger' id='submit' onclick='submitForm(this);'>Submit</button></div>");
}

function appendSettings(pidsettings, type, piddata, scale)
{
    var navtabs = pidsettings.find(".nav-tabs");
    if (navtabs.size() == 0)
    {
        pidsettings.append("<ul class='nav nav-tabs' role='tablist'></ul>");
        navtabs = pidsettings.find(".nav-tabs");
    }
    navtabs.append("<li class='nav-item'><a class='nav-link' href='#" + type + "' role='tab' data-toggle='tab'>" + type.capitalizeFirstLetter() + "</a></li>");

    var tabcontent = pidsettings.find(".tab-content");
    if (tabcontent.size() == 0)
    {
        pidsettings.append("<div class='tab-content'></div>");
        tabcontent = pidsettings.find(".tab-content");
    }
    var heatDiv = tabcontent.find("#" + type);
    if (heatDiv.size() == 0)
    {
        tabcontent.append("<div id='" + type + "' role='tabpanel' class='tab-pane'></div>")
        heatDiv = tabcontent.find("#" + type);
    }

    heatDiv.append("<div class='form-group form-inline row'><label for='cycletime_input' class='form-control-label col-sm-4'>Cycle Time</label><div class='col-sm-6'><input type='number' class='form-control' id='cycletime_input' placeholder='Cycle Time'/></div><label class='form-control-label col-sm-2' for='cycletime_input'>secs</label></div>");
    heatDiv.append("<div class='form-group form-inline row'><label for='p_input' class='form-control-label col-sm-4'>P</label><div class='col-sm-6'><input type='number' class='form-control' id='p_input' placeholder='Proportional'/></div><label class='form-control-label col-sm-2' for='p_input'>secs/&#176" + scale + "</label></div>");
    heatDiv.append("<div class='form-group form-inline row'><label class='form-control-label col-sm-4' for='i_input'>I</label><div class='col-sm-6'><input type='number' class='form-control' id='i_input' placeholder='Integral'/></div><label class='form-control-label col-sm-2' for='i_input'>&#176" + scale + "/sec</label></div>");
    heatDiv.append("<div class='form-group form-inline row'><label class='form-control-label col-sm-4' for='d_input'>D</label><div class='col-sm-6'><input type='number' class='form-control' id='d_input' placeholder='Integral'/></div><label class='form-control-label col-sm-2' for='i_input'>secs</label></div>");

    heatDiv.find("#cycletime_input").val(piddata[type].cycle);
    heatDiv.find("#p_input").val(piddata[type].p);
    heatDiv.find("#i_input").val(piddata[type].i);
    heatDiv.find("#d_input").val(piddata[type].d);
}

function showManual(card)
{
    card = $(card);
    var pidsettings = card.find('#pidsettings');
    var piddata = card.data("pid");
    if (pidsettings.size() == 0)
    {
        card.append("<div id='pidsettings'></div>");
        pidsettings = card.find('#pidsettings');
    }

    // Make sure we clear out the settings form
    pidsettings.empty();
    pidsettings.append("<form></form>");
    var form = pidsettings.find("form");
    form.append("<div class='form-group form-inline row'><label for='cycletime_input' class='form-control-label col-sm-4'>Cycle Time</label><div class='col-sm-6'><input type='number' class='form-control' id='cycletime_input' placeholder='Cycle Time' /></div><label class='form-control-label col-sm-2' for='cycletime_input'>secs</label></div>");
    form.append("<div class='form-group form-inline row'><label for='dutycycle_input' class='form-control-label col-sm-4'>Duty Cycle</label><div class='col-sm-6'><input type='number' class='form-control' id='dutycycle_input' placeholder='Duty Cycle' /></div><label class='form-control-label col-sm-2' for='dutycycle_input'>%</label></div>");

    form.find("#dutycycle_input").val(piddata.manualduty);
    form.find("#cycletime_input").val(piddata.manualtime);
    form.append("<div class='form-group form-inline row'><button type='button' class='btn btn-danger' id='submit' onclick='submitForm(this);'>Submit</button></div>");
}

function showHysteria(card)
{
    card = $(card);
    var pidsettings = card.find('#pidsettings');
    var piddata = card.data("pid");
    var tempdata = card.data("temp");
    if (pidsettings.size() == 0)
    {
        card.append("<div id='pidsettings'></div>");
        pidsettings = card.find('#pidsettings');
    }

    // Make sure we clear out the settings form
    pidsettings.empty();
    pidsettings.append("<form></form>");
    var form = pidsettings.find("form");

    form.append("<div class='form-group form-inline row'><label for='min_input' class='form-control-label col-sm-4'>Min</label><div class='col-sm-6'><input type='number' class='form-control' id='min_input' placeholder='Minimum' /></div><label class='form-control-label col-sm-2' for='min_input'>&#176" + tempdata.scale + "</label></div>");
    form.append("<div class='form-group form-inline row'><label for='max_input' class='form-control-label col-sm-4'>Max</label><div class='col-sm-6'><input type='number' class='form-control' id='max_input' placeholder='Maximum' /></div><label class='form-control-label col-sm-2' for='max_input'>&#176" + tempdata.scale + "</label></div>");
    form.append("<div class='form-group form-inline row'><label for='time_input' class='form-control-label col-sm-4'>Time</label><div class='col-sm-6'><input type='number' class='form-control' id='time_input' placeholder='Time' /></div><label class='form-control-label col-sm-2' for='max_input'>minutes</label></div>");
    form.find("#min_input").val(piddata.min);
    form.find("#max_input").val(piddata.max);
    form.find("#time_input").val(piddata.time);
    form.append("<div class='form-group form-inline row'><button type='button' class='btn btn-danger' id='submit' onclick='submitForm(this);'>Submit</button></div>");
}

function submitForm(element)
{
    var settings = $(element).closest("#pidsettings");
    var device = $(element).closest(".card-block")[0].id;
    var mButton = $(element).closest(".card-block").find("#mode").find(".btn-success")[0];
    if (mButton == undefined)
    {
        mButton = $(element).closest(".card-block").find("#mode").find(".btn-danger")[0];
    }
    var mode = mButton.id;
    if (mode == "off")
    {
        switchOff(device, settings);
    }
    else if (mode == "auto")
    {
        switchAuto(device, settings);
    }
    else if (mode == "hysteria")
    {
        switchHysteria(device, settings);
    }
    else if (mode == "manual")
    {
        switchManual(device, settings);
    }
}

function switchOff(device, settings)
{
    var data = {};
    data["inputunit"] = device;
    data["mode"] = "off";
    updatePID(device, data);
}

function switchAuto(device, settings)
{
    var data = {};
    data["inputunit"] = device;
    data["mode"] = "auto";

    data["setpoint"] = settings.find("#setpoint_input").val();
    var heatData = settings.find("#heat");
    if (heatData.size() == 1)
    {
        data["heatp"] = heatData.find("#p_input").val();
        data["heati"] = heatData.find("#i_input").val();
        data["heatd"] = heatData.find("#d_input").val();
        data["heatcycletime"] = heatData.find("#cycletime_input").val();
    }
    var coolData = settings.find("#cool");
    if (coolData.size() == 1);
    {
        data["coolp"] = coolData.find("#p_input").val();
        data["cooli"] = coolData.find("#i_input").val();
        data["coold"] = coolData.find("#d_input").val();
        data["coolcycletime"] = coolData.find("#cycletime_input").val();
    }

    updatePID(device, data);
}

function switchManual(device, settings)
{
    var data = {};
    data["inputunit"] = device;
    data["mode"] = "manual";
    data["dutycycle"] = settings.find("#dutycycle_input").val();
    data["cycletime"] = settings.find("#cycletime_input").val();
    updatePID(device, data);
}

function switchHysteria(device, settings)
{
    var data = {};
    data["inputunit"] = device;
    data["mode"] = "hysteria";
    data["max"] = settings.find("#max_input").val();
    data["min"] = settings.find("#min_input").val();
    data["time"] = settings.find("#time_input").val();
    updatePID(device, data);
}

function updatePID(device, data)
{
    $("#"+device).find("#submit").text("Updating");
    $.ajax({
            url : '/updatepid',
            type : 'POST',
            data : data,
            dataType : 'text',
            success : function(data) {
                data = null
                $("#"+device).find("#submit").text("Updated");
                setTimeout(clearPIDSettings, 5000, device);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                alert("Status: " + textStatus); alert("Error: " + errorThrown); 
            }    

        });
    
}

function clearPIDSettings(device) 
{
    var pidSettings = $("#"+device).find("#pidsettings");
    pidSettings.animate({opacity:0.01}, 200, 
        function() {pidSettings.slideUp(200, function()
        { 
            pidSettings.remove();
        });
    });
    var successBtn = $("#"+device).find(".btn-success");
    if (successBtn.size() == 1)
    {
        successBtn.removeClass("btn-success");
        if (successBtn.hasClass("active"))
        {
            successBtn.addClass("btn-danger");
        }

    }
}

$(document).ready(function() {
    requestData();
    setInterval("requestData()",10000);
});
