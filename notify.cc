// Copyright (C) 2017 - 2019, Rory Bradford <rory@dysfunctionalprogramming.com> and contributors
// MIT License

#include <node.h>
#include <systemd/sd-daemon.h>
#include <systemd/sd-journal.h>

using v8::Number;
namespace notify {

  

void set(const v8::FunctionCallbackInfo<v8::Value>& args, int pid, const char* status) {
  int ret = sd_pid_notify(pid, 0, status);
  v8::Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(v8::Number::New(isolate, ret));
}


const char* ToCString(const v8::String::Utf8Value& value) {
  return *value ? *value : "STATUS=conversion failed";
}

void sendstate(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  v8::String::Utf8Value str(isolate, args[1]);
  const char *state = ToCString(str);
  int pid = args[0].As<Number>()->Value();
  set(args, pid, state);
}

void interval(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  uint64_t interval;
  int res = sd_watchdog_enabled(0, &interval);

  if (res > 0) {
    args.GetReturnValue().Set(v8::Number::New(isolate, interval / 1000));
  } else {
    args.GetReturnValue().Set(v8::Number::New(isolate, 0));
  }
}

void journal_print(const v8::FunctionCallbackInfo<v8::Value>& args) {
  int level = args[0].As<Number>()->Value();
  v8::Isolate* isolate = args.GetIsolate();
  v8::String::Utf8Value str(isolate, args[1]);
  const char *message = ToCString(str);
  sd_journal_print(level, message);
}

}  // namespace notify

void Init(v8::Local<v8::Object> exports) {
  NODE_SET_METHOD(exports, "watchdogInterval", notify::interval);
  NODE_SET_METHOD(exports, "sendState", notify::sendstate);
  NODE_SET_METHOD(exports, "journalPrint", notify::journal_print);
}

NODE_MODULE(addon, Init)

