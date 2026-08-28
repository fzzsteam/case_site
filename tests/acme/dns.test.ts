import { getChallengeRecordName } from "@/lib/acme/dns";

it("maps root-domain ACME challenges to the root DNS record", () => {
  expect(getChallengeRecordName("fzzsai.com", "fzzsai.com")).toBe("_acme-challenge");
});

it("maps edu subdomain ACME challenges to a relative AliDNS RR", () => {
  expect(getChallengeRecordName("fzzsai.com", "*.edu.fzzsai.com")).toBe("_acme-challenge.edu");
});

it("rejects a challenge outside the configured DNS zone", () => {
  expect(() => getChallengeRecordName("fzzsai.com", "example.com")).toThrow("不属于 DNS zone");
});
