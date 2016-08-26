/**
 * Created by Hisune on 2016/8/24.
 * User: hi@hisune.com
 */
'use strict';

const mailer = require('nodemailer'),
    result = $('#email-result'),
    storage = require('electron-json-storage');

let editor;

storage.get('email-week', (err, data) => {
    for(var i in data){
        $('#email-' + i).val(data[i]);
    }
    let content = data.content || '**工作内容：**\n\n**工作计划：**\n\n';
    editor = new Editor();
    editor.render($('#email-content')[0]);
    editor.codemirror.getDoc().setValue(content);
});

var customDate = function(date)
{
    var custom = {};
    custom.obj = date || new Date();
    var tempMonth = custom.obj.getMonth() + 1;
    custom.year = custom.obj.getFullYear();
    custom.month = tempMonth < 10 ? '0' + tempMonth : tempMonth;
    custom.day = custom.obj.getDate() < 10 ? '0' + custom.obj.getDate() : custom.obj.getDate();
    custom.time = custom.obj.toString().split(" ")[4];
    var tempSplit = custom.time.split(":");
    custom.hour = tempSplit[0];
    custom.minute = tempSplit[1];
    custom.second = tempSplit[2];
    custom.date = custom.year + '-' + custom.month + '-' + custom.day;
    custom.full = custom.date + ' ' + custom.time;
    custom.timestamp = Math.floor(custom.obj.getTime()  / 1000);
    return custom;
};

$('#email-send').click(function(){
    let _t = $(this),
        service = $('#email-service').val(),
        user = $('#email-user').val(),
        password = $('#email-password').val(),
        sendTo = $('#email-send_to').val(),
        title = $('#email-title').val(),
        content = editor.codemirror.getValue();
    _t.attr('disabled', true);

    storage.set('email-week', {
        service: service,
        user: user,
        password: password,
        send_to: sendTo,
        title: title,
        content: content
    }, (error) => {

    });

    if(service && user && password && sendTo && title && content){
        let now = new Date(),
            date = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            week = date.getDay() || 7,
            today = date.getTime(),
            array = {
                '%week0%': customDate(new Date(today - (week - 7) * 86400000)).date,
                '%week1%': customDate(new Date(today - (week - 1) * 86400000)).date,
                '%week2%': customDate(new Date(today - (week - 2) * 86400000)).date,
                '%week3%': customDate(new Date(today - (week - 3) * 86400000)).date,
                '%week4%': customDate(new Date(today - (week - 4) * 86400000)).date,
                '%week5%': customDate(new Date(today - (week - 5) * 86400000)).date,
                '%week6%': customDate(new Date(today - (week - 6) * 86400000)).date
            };
        title = title.replace(/%week0%/g, array['%week0%'])
            .replace(/%week1%/g, array['%week1%'])
            .replace(/%week2%/g, array['%week2%'])
            .replace(/%week3%/g, array['%week3%'])
            .replace(/%week4%/g, array['%week4%'])
            .replace(/%week5%/g, array['%week5%'])
            .replace(/%week6%/g, array['%week6%']);
        content = content.replace(/%week0%/g, array['%week0%'])
            .replace(/%week1%/g, array['%week1%'])
            .replace(/%week2%/g, array['%week2%'])
            .replace(/%week3%/g, array['%week3%'])
            .replace(/%week4%/g, array['%week4%'])
            .replace(/%week5%/g, array['%week5%'])
            .replace(/%week6%/g, array['%week6%']);

        var transporter = mailer.createTransport({
            service: service,
            auth: {
                user: user,
                pass: password
            }
        });
        var mailOptions = {
            from: user,
            to: sendTo,
            subject: title,
            html: editor.constructor.markdown(content)
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                result.text(error);
            }else{
                result.text(info.response);
            }
            _t.attr('disabled', false);
        });
    }else{
        alert('参数填写不完整');
        _t.attr('disabled', false);
    }
});